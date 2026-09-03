# Order Management System — Feature Specification

> Reference implementation: this Next.js project (radiant-picks). This document describes the
> system **exactly as it behaves today**, with per-section **Laravel port notes** so it can be
> replicated 1:1 in a Laravel project.
>
> Source of truth files (this repo):
> - `prisma/schema.prisma` — data model
> - `app/api/checkout/route.js` — public order creation
> - `src/actions/orders.js` — admin data layer (server actions)
> - `app/admin/orders/page.jsx`, `app/admin/orders/[orderNo]/page.jsx` — admin UI
> - `app/(storefront)/cart/page.jsx`, `app/(storefront)/checkout/page.jsx`, `app/(storefront)/thankyou/page.jsx` — storefront UI
> - `src/lib/cartStorage.js`, `src/lib/telegram.js`

---

## 1. System overview

| Aspect | Behavior |
|---|---|
| Ordering model | **Guest checkout** — no customer login, no user account required to order |
| Payment | **No payment gateway.** Cash-on-delivery style; admin manages prices/totals manually |
| Order number | Random **6-digit** string (`100000`–`999999`), unique in DB |
| Statuses | `pending` → `processing` → `completed`, alternative terminal `cancelled` |
| Pricing | Snapshot-based line items; totals **recalculated by admin actions** after any edit |
| Inventory | **Not decremented** on order placement |
| Notifications | **Telegram bot alert** on new order (no emails) |
| Fraud prevention | Device hash + IP captured per order; one pending order per device; device blocklist (see `device-blocking.md`) |
| Currency | Bangladeshi Taka (৳), area-based delivery charge |

### Intended status flow

```
pending ──→ processing ──→ completed
   │
   └──────→ cancelled (terminal alternative)
```

There is **no state machine**: any status can jump to any other status (free-form `<select>`).
Statuses are plain strings in the DB, not DB enums.

---

## 2. Data model

### 2.1 `Order`

```prisma
model Order {
  id            String       @id @default(uuid())
  orderNo       String       @unique
  user          User?        @relation(fields: [userId], references: [id])
  userId        String?      // nullable — guest checkout
  total         Decimal
  orderStatus   String
  details       OrderDetails?
  items         OrderItem[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([userId])
  @@index([orderNo])
  @@index([orderStatus])
}
```

### 2.2 `OrderDetails` (1:1 with Order — customer/shipping snapshot)

```prisma
model OrderDetails {
  id              String   @id @default(uuid())
  order           Order    @relation(fields: [orderId], references: [id])
  orderId         String   @unique
  customerName    String?
  shippingAddress String
  phoneNumber     String?
  shippingArea    String        // "Inside Dhaka" | "Outside Dhaka"
  deliveryCharge  Decimal
  ipAddress       String?       // captured at checkout (fraud reference)
  deviceHash      String?       // FingerprintJS visitorId (see device-blocking.md)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 2.3 `OrderItem` (1:N with Order — decoupled snapshot, no FK to Product)

```prisma
model OrderItem {
  id            String   @id @default(uuid())
  order         Order    @relation(fields: [orderId], references: [id])
  orderId       String
  productTitle  String
  sku           String?
  itemImagePath String
  purchasePrice Decimal   // unit price snapshot
  quantity      Int
  variantName   String?   // e.g. "Size / Color" or "Default"
  variantId     String?   // stored but NO Prisma relation to ProductVariant
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([orderId])
  @@index([productTitle])
}
```

**Design intent:** line items are a **snapshot** (`productTitle`, `sku`, `itemImagePath`,
`purchasePrice`, `variantName`) rather than FKs to the live catalog, so later catalog changes
never mutate historical orders.

#### 🐘 Laravel port — migrations

```php
// database/migrations/xxxx_create_orders_tables.php
Schema::create('orders', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('order_no', 6)->unique();
    $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
    $table->decimal('total', 10, 2);
    $table->string('order_status');           // pending|processing|completed|cancelled
    $table->timestamps();
    $table->index(['order_no']);
    $table->index(['order_status']);
});

Schema::create('order_details', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('order_id')->unique()->constrained('orders')->cascadeOnDelete();
    $table->string('customer_name')->nullable();
    $table->string('shipping_address');
    $table->string('phone_number')->nullable();
    $table->string('shipping_area');          // "Inside Dhaka" | "Outside Dhaka"
    $table->decimal('delivery_charge', 10, 2);
    $table->string('ip_address')->nullable();
    $table->string('device_hash')->nullable();
    $table->timestamps();
});

Schema::create('order_items', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
    $table->string('product_title');
    $table->string('sku')->nullable();
    $table->string('item_image_path');
    $table->decimal('purchase_price', 10, 2);
    $table->unsignedInteger('quantity');
    $table->string('variant_name')->nullable();
    $table->string('variant_id')->nullable();
    $table->timestamps();
    $table->index(['order_id']);
    $table->index(['product_title']);
});
```

#### 🐘 Laravel port — Eloquent models

```php
class Order extends Model
{
    use HasUuids;

    protected $fillable = ['order_no', 'user_id', 'total', 'order_status'];
    protected $casts = ['total' => 'decimal:2'];

    public function details() { return $this->hasOne(OrderDetail::class); }
    public function items()   { return $this->hasMany(OrderItem::class); }
    public function user()    { return $this->belongsTo(User::class); } // nullable
}

class OrderDetail extends Model
{
    use HasUuids;
    protected $fillable = ['order_id', 'customer_name', 'shipping_address', 'phone_number',
                           'shipping_area', 'delivery_charge', 'ip_address', 'device_hash'];
    protected $casts = ['delivery_charge' => 'decimal:2'];
    public function order() { return $this->belongsTo(Order::class); }
}

class OrderItem extends Model
{
    use HasUuids;
    protected $fillable = ['order_id', 'product_title', 'sku', 'item_image_path',
                           'purchase_price', 'quantity', 'variant_name', 'variant_id'];
    protected $casts = ['purchase_price' => 'decimal:2'];
    public function order() { return $this->belongsTo(Order::class); }
}
```

---

## 3. Order lifecycle & statuses

### 3.1 Canonical status list

Hard-coded identically in both admin pages (`app/admin/orders/page.jsx:7` and
`app/admin/orders/[orderNo]/page.jsx:9`):

```js
const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
```

### 3.2 Status colors (Tailwind classes used in the UI)

| Status | Pill | Dot |
|---|---|---|
| `pending` | `bg-amber-50 text-amber-700` (dark: `bg-amber-900/30 text-amber-400`) | `bg-amber-500` (detail page dot: `bg-amber-400`) |
| `processing` | `bg-blue-50 text-blue-700` (dark: `bg-blue-900/30 text-blue-400`) | `bg-blue-500` |
| `completed` | `bg-emerald-50 text-emerald-700` (dark: `bg-emerald-900/30 text-emerald-400`) | `bg-emerald-500` |
| `cancelled` | `bg-red-50 text-red-700` (dark: `bg-red-900/30 text-red-400`) | `bg-red-500` |

Rendered as rounded-full pills: `inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold`.

### 3.3 Transition rules

- New orders are always created with `orderStatus: 'pending'`.
- The admin picks any of the four values from a dropdown — **no validation of transitions**,
  any status can go to any other.
- Business rules tied to status:
  - **Completed orders:** items cannot be removed — server-side check in `deleteOrderItem`
    (`src/actions/orders.js:85`): `Cannot remove items from completed orders`. The quantity
    stepper and remove button are hidden in the UI when status is `completed`
    (`canEdit = order.orderStatus !== 'completed'`).
  - **Completed OR cancelled orders:** the Delivery Charge editor is locked (read-only with a
    "Locked" badge) on the order detail page.
  - **Revenue reporting** (dashboard) excludes `cancelled` orders.

> ⚠️ **Known gap (replicate or fix in Laravel):** `updateOrderItemQuantity` has no server-side
> completed-order check (only the UI hides the control). Only `deleteOrderItem` enforces it.
> Also there is no transition validation at all.

#### 🐘 Laravel port

Use a string column + a PHP backed enum for safety:

```php
// app/Enums/OrderStatus.php
enum OrderStatus: string
{
    case Pending    = 'pending';
    case Processing = 'processing';
    case Completed  = 'completed';
    case Cancelled  = 'cancelled';
}
```

If replicating behavior **exactly**, keep the free-form select (no transition validation) and
enforce only these two rules:

```php
// In DeleteOrderItem action:
if ($order->order_status === OrderStatus::Completed->value) {
    throw ValidationException::withMessages(['item' => 'Cannot remove items from completed orders']);
}

// Delivery charge editable only when:
in_array($order->order_status, [OrderStatus::Completed->value, OrderStatus::Cancelled->value]) === false;
```

---

## 4. Checkout flow (order creation)

### 4.1 Endpoint

`POST /api/checkout` — **public** (no auth). Body:

```json
{
  "name": "John Doe",
  "mobile": "01712345678",
  "address": "House 12, Road 5, Dhanmondi, Dhaka",
  "shippingArea": "Inside Dhaka",
  "items": [
    { "title": "...", "productSlug": "...", "sku": "...", "image": "...",
      "variantId": "...", "variantName": "...", "price": 1500, "salePrice": 1200, "quantity": 2 }
  ],
  "deviceHash": "<FingerprintJS visitorId>"
}
```

### 4.2 Server-side logic (`app/api/checkout/route.js`) — exact behavior

1. **Client IP capture** (first non-empty wins):
   ```js
   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()   // 1
   || request.headers.get('x-real-ip')                             // 2
   || request.headers.get('cf-connecting-ip')                      // 3
   || null
   ```
   Stored into `OrderDetails.ipAddress`.

2. **Required-field validation** (server only checks presence — format validation is
   client-side):
   `name, mobile, address, shippingArea, items?.length` → else `400`
   `{ error: 'Missing required checkout fields.' }`

3. **Blocked-device guard** (if `deviceHash` present) → `403`
   `{ error: 'You have been blocked from placing orders.' }` (see `device-blocking.md`)

4. **One-pending-order-per-device guard** (if `deviceHash` present) → `403`
   `{ error: 'You already have a pending order #<orderNo>. Please wait for it to be processed.' }`

5. **Delivery charge:**
   ```js
   const deliveryCharge = shippingArea === 'Outside Dhaka' ? 120 : 50;
   ```

6. **Totals:**
   ```js
   subtotal = Σ Number(item.salePrice ?? item.price ?? 0) × Number(item.quantity ?? 0)
   total    = subtotal + deliveryCharge
   ```

7. **Order number:** `orderNo = String(Math.floor(100000 + Math.random() * 900000))`
   (random 6-digit; uniqueness enforced only by the DB unique constraint — **no retry logic**).

8. **Single nested create** — `Order` (with `orderStatus: 'pending'`) + `OrderDetails` +
   `OrderItem[]` in one `prisma.order.create`. Item mapping:
   ```js
   productTitle:  item.title || item.productSlug,
   sku:           item.sku || null,
   itemImagePath: item.image || '',
   purchasePrice: Number(item.salePrice ?? item.price ?? 0),
   quantity:      Number(item.quantity ?? 0),
   variantName:   item.variantName || null,
   variantId:     item.variantId || null,
   ```

9. **Telegram alert** fired fire-and-forget (failures only logged, never block the order) —
   see §8.

10. **Response:** `{ "orderNo": "...", "total": "..." }` (HTTP 200).

### 4.3 Client-side validation rules (checkout form)

| Field | Rules (exact) |
|---|---|
| Name | required; `3 ≤ length ≤ 20`; regex `/^[A-Za-z\s]+$/` — errors: *"Name is required."*, *"Name must be at least 3 characters."*, *"Name must be under 20 characters."*, *"Only letters and spaces allowed."* |
| Mobile | required; regex `/^(013\|014\|015\|016\|017\|018\|019)\d{8}$/` — error: *"Enter a valid BD mobile number (e.g. 017XXXXXXXX)."* |
| Address | required; `20 ≤ length ≤ 100` — errors: *"Address is required."*, *"Address must be at least 20 characters."*, *"Address must be under 100 characters."* |
| Shipping area | radio, default `Inside Dhaka` |

Client-side totals preview: `deliveryCharge = shippingArea === 'Outside Dhaka' ? 120 : 80`.

> ⚠️ **Discrepancy (documented as-is):** the checkout **UI shows and previews Inside Dhaka
> delivery as 80 taka** (radio label "Inside Dhaka — 80 taka", summary, and GTM payloads all
> use 80), but the **API persists 50** (`shippingArea === 'Outside Dhaka' ? 120 : 50`). The
> DB `total` is therefore computed with 50 while the customer saw 80. Decide one value when
> porting; `docs/data-model.md` also says 50 or 120.

#### 🐘 Laravel port

```php
// routes/api.php
Route::post('/checkout', [CheckoutController::class, 'store']);

// app/Http/Requests/CheckoutRequest.php
public function rules(): array
{
    return [
        'name'         => ['required', 'string', 'min:3', 'max:20', 'regex:/^[A-Za-z\s]+$/'],
        'mobile'       => ['required', 'string', 'regex:/^(013|014|015|016|017|018|019)\d{8}$/'],
        'address'      => ['required', 'string', 'min:20', 'max:100'],
        'shippingArea' => ['required', 'in:Inside Dhaka,Outside Dhaka'],
        'items'        => ['required', 'array', 'min:1'],
        'items.*.salePrice' => ['nullable', 'numeric', 'min:0'],
        'items.*.price'     => ['nullable', 'numeric', 'min:0'],
        'items.*.quantity'  => ['required', 'integer', 'min:1'],
        'deviceHash'   => ['nullable', 'string'],
    ];
}

// app/Http/Controllers/CheckoutController.php (core)
public function store(CheckoutRequest $request)
{
    $data = $request->validated();

    $ip = $request->headers->get('x-forwarded-for')  // first comma segment
        ?: $request->headers->get('x-real-ip')
        ?: $request->headers->get('cf-connecting-ip');

    if (!empty($data['deviceHash'])) {
        if (BlockedDevice::where('device_hash', $data['deviceHash'])->exists()) {
            return response()->json(
                ['error' => 'You have been blocked from placing orders.'], 403);
        }
        $pending = OrderDetail::where('device_hash', $data['deviceHash'])
            ->whereHas('order', fn ($q) => $q->where('order_status', 'pending'))
            ->first();
        if ($pending) {
            return response()->json(
                ['error' => "You already have a pending order #{$pending->order->order_no}. Please wait for it to be processed."],
                403);
        }
    }

    $deliveryCharge = $data['shippingArea'] === 'Outside Dhaka' ? 120 : 50;
    $subtotal = collect($data['items'])
        ->sum(fn ($i) => (float)($i['salePrice'] ?? $i['price'] ?? 0) * (int)($i['quantity'] ?? 0));

    $order = DB::transaction(function () use ($data, $ip, $deliveryCharge, $subtotal) {
        return Order::create([
            'order_no'     => $this->generateOrderNo(),   // random 6-digit, retry on collision
            'total'        => $subtotal + $deliveryCharge,
            'order_status' => 'pending',
            'details'      => [...],                       // via relationship create
            'items'        => [...],                       // via relationship createMany
        ]);
    });

    SendOrderAlert::dispatch($order->fresh(['details', 'items'])); // queued, fire-and-forget

    return response()->json(['orderNo' => $order->order_no, 'total' => $order->total]);
}

// Unique order number with retry (recommended improvement over the original):
private function generateOrderNo(): string
{
    do {
        $no = (string) random_int(100000, 999999);
    } while (Order::where('order_no', $no)->exists());
    return $no;
}
```

---

## 5. Total recomputation rules (admin edits)

The order total is **always recomputed** from line items + delivery charge after any admin
edit. The canonical formula (used in `updateOrderItemQuantity`, `deleteOrderItem`,
`updateOrderDetails`):

```
total = Σ( purchasePrice × quantity ) + deliveryCharge
```

| Server action (`src/actions/orders.js`) | Behavior |
|---|---|
| `updateOrderItemQuantity(itemId, quantity)` | Updates item qty → re-fetches order w/ items+details → recomputes total |
| `deleteOrderItem(itemId)` | Throws `Item not found` if missing; throws `Cannot remove items from completed orders` if completed; deletes → recomputes total from remaining items |
| `updateOrderDetails(orderId, data)` | Updates any OrderDetails field; if `deliveryCharge` changed → recomputes total from the order's current items + new charge |
| `updateOrderStatus(id, data)` | Updates any Order field passed (UI passes `{ orderStatus }`); does **not** touch total |

All actions end with `serialize()` (`JSON.parse(JSON.stringify(obj))`) to strip Prisma
`Decimal`/`Date` objects before they reach client components. Every mutation calls
`revalidatePath('/admin/orders')`.

#### 🐘 Laravel port

Put the recompute rule in one place, e.g. on the `Order` model:

```php
public function recalculateTotal(): void
{
    $subtotal = $this->items()->get()
        ->sum(fn (OrderItem $i) => (float)$i->purchase_price * (int)$i->quantity);
    $this->update(['total' => $subtotal + (float)($this->details->delivery_charge ?? 0)]);
}
```

Call it after quantity updates, item deletions, and delivery-charge updates.

---

## 6. Admin API reference

All `/api/admin/**` routes are JWT-guarded by middleware (`proxy.js`, matcher
`/admin/:path*`): pages redirect to `/admin/login?redirect=<path>`, API calls get
`401 { error: 'Unauthorized' }`. Session = `admin_session` HTTP-only cookie, HS256 JWT,
8h expiry, payload must include `role === 'admin'`.

> The admin UI actually uses the **server actions** (§5) for reads/mutations; these REST
> routes exist in parallel and are documented for completeness/porting.

| Method | Path | Purpose | Details |
|---|---|---|---|
| GET | `/api/admin/orders` | List all | Includes `details` + `items`, ordered `createdAt desc` |
| GET | `/api/admin/orders/[id]` | Fetch one | Matches `id` **or** `orderNo` (`OR` query); includes `details, items, user`; `404 { error: 'Order not found.' }` |
| PUT | `/api/admin/orders/[id]` | Status update | Body `{ orderStatus }`; updates; includes `details, items`; `404` on failure |
| GET | `/api/admin/orders/search?q=` | Typeahead | Case-insensitive `contains` on `orderNo`; top 6; returns `{ id, orderNo, orderStatus, total, createdAt }` |
| POST | `/api/admin/orders/block` | Block device | Body `{ deviceHash, orderNo, reason }`; `400` missing hash; `409` already blocked — see `device-blocking.md` |
| DELETE | `/api/admin/orders/unblock?deviceHash=` | Unblock device | Deletes blocklist rows for hash — see `device-blocking.md` |

Server actions used by the admin UI (`src/actions/orders.js`):

| Action | Used by | Returns |
|---|---|---|
| `getOrders()` | Orders list page | All orders incl. `details, items, user`, newest first |
| `getOrderByOrderNo(orderNo)` | Order detail page | One order incl. `details, items, user` (null if missing) |
| `getRecentOrders(limit = 5)` | Dashboard | Newest N orders incl. `details` |
| `getDashboardStats()` | Dashboard | `{ products, categories, orders, revenue }` — revenue = `SUM(total)` where status ≠ `cancelled` |
| `updateOrderStatus` / `updateOrderItemQuantity` / `deleteOrderItem` / `updateOrderDetails` | Detail page + list expand | See §5 |

#### 🐘 Laravel port

```php
// routes/web.php (admin) — mirror of the endpoint surface
Route::middleware(['auth', 'can:admin'])->prefix('admin')->group(function () {
    Route::get('/orders',                   [AdminOrderController::class, 'index']);
    Route::get('/orders/search',            [AdminOrderController::class, 'search']); // BEFORE /{order}
    Route::get('/orders/{order}',           [AdminOrderController::class, 'show']);   // route binding by order_no
    Route::put('/orders/{order}/status',    [AdminOrderController::class, 'updateStatus']);
    Route::patch('/orders/{order}/items/{item}/quantity', [AdminOrderController::class, 'updateQuantity']);
    Route::delete('/orders/{order}/items/{item}',         [AdminOrderController::class, 'deleteItem']);
    Route::patch('/orders/{order}/details', [AdminOrderController::class, 'updateDetails']);
});
```

- Route-model binding on `order_no` replicates the "id **or** orderNo" lookup.
- Search: `Order::where('order_no', 'like', "%{$q}%")->latest()->limit(6)->get([...])`
- Dashboard revenue: `Order::where('order_status', '!=', 'cancelled')->sum('total')`
- Auth gate: Laravel `auth` + `role:admin` middleware replaces the JWT `proxy.js`
  (`src/lib/auth.js`, `src/lib/auth-edge.js`).

---

## 7. Admin UI

### 7.1 Orders list — `/admin/orders` (`app/admin/orders/page.jsx`)

Client component; loads everything once via `getOrders()`; filtering is **client-side**
(`useMemo`), no pagination.

**Header:** "Orders" (H1) + "{n} orders" subtitle.

**Filter bar:**
- Search input (magnifier icon, placeholder *"Search by order number or phone…"*) — matches
  `orderNo` **or** `details.phoneNumber` (case-insensitive substring).
- Status `<select>`: `All Status` + the 4 statuses.
- "Clear" text button (visible only when a filter/search is active) — resets both.

**Desktop table** (`md+`, rounded-xl bordered card) — columns:

| Column | Content |
|---|---|
| Order | `orderNo` — link to `/admin/orders/{orderNo}` (brand color, hover underline) |
| Customer | Name (bold) over phone (small, gray). Fallback: `user.name`, else `—` |
| Total | `৳` + `toLocaleString()` |
| Status | Colored pill (§3.2) |
| Date | `dd/mm/yy` + 12h time (e.g. `02/09/26 3:45 PM`) |
| IP Address | `details.ipAddress` or `—` |
| (last) | Chevron expand/collapse button |

**Mobile:** card list (same data), tap row or chevron to expand.

**Expandable row detail** (inline under the row, gradient background) — renders:
1. **Order Items card** — purple header "Order Items ({n})"; each row: 48–56px thumbnail,
   title (truncated), optional `variantName` chip, `৳{price} × {qty}` and bold line total.
2. **Customer card** — blue header; Name / Phone / Area (chip) / Address (boxed).
3. **Status card** — amber header; `<select>` of the 4 statuses with a colored status dot;
   on change calls `updateOrderStatus(order.id, { orderStatus })` then refetches all orders.
4. **Delivery card** — emerald header; Charge ("Free" styled green when 0), Subtotal,
   bold Total in brand color.

**Empty states:** *"No orders yet."* (no data) / *"No orders match your filters."* (filtered).

### 7.2 Order detail — `/admin/orders/[orderNo]` (`app/admin/orders/[orderNo]/page.jsx`)

Client component; loads via `getOrderByOrderNo(orderNo)`; spinner while loading; "not found"
state with sad-face icon, *"Order not found"*, *"No order matches "{orderNo}""* and a
"← Back to orders" button.

**Header row:** back-arrow square button (links to `/admin/orders`) · order number as H1 ·
*"Placed {weekday, month day, year} at {hh:mm AM}"* · status pill with dot (right).

**Order Items card** (full width):
- Each item row: 64px image (placeholder box icon if missing), title (truncate), badges row
  — `SKU: {sku || 'N/A'}` (indigo badge) and `variantName` chip (gray) — price line
  `৳{price} × {qty}`, right-aligned bold line total.
- **When `canEdit` (status ≠ `completed`)**, under each row:
  - Quantity stepper: `−` (disabled at qty 1) / current qty / `+`. **Each click opens a
    `ConfirmDialog`** — title *"Update Quantity"*, message *"Change quantity to {n}?"*,
    confirm "Update" (default variant). Confirms → `updateOrderItemQuantity(itemId, n)` →
    refetch order.
  - Red trash button *"Remove item"* → `ConfirmDialog` — title *"Remove Item"*, message
    *"Are you sure you want to remove this item from the order?"*, confirm "Remove"
    (**danger** variant). Confirms → `deleteOrderItem(itemId)` → refetch.
- **Totals footer** (gray band): Subtotal · Delivery (shows "Free" when 0) · bold Total
  (brand purple `#2f0f6b`, light-mode / `#a78bfa` dark).

**Bottom row: 3 cards** (`grid sm:grid-cols-2 lg:grid-cols-3`):

1. **Status card**
   - "Order Status" label + `<select>` (4 statuses). **Saves instantly on change** via
     `updateOrderStatus` — shows spinner + "Saving…" while in-flight, then "Saved ✓" (emerald)
     for 2 seconds; refetches the order.
   - "Delivery Charge" — when status is `completed` or `cancelled`: read-only display with a
     🔒 **"Locked"** badge. Otherwise: number input (step 0.01, min 0, ৳ prefix) + purple
     "Save" button (spinner while saving) → `updateOrderDetails(order.id, { deliveryCharge })`
     → refetch. Helper text: *"Updating delivery charge will recalculate the total."*

2. **Customer card**
   - Avatar row: phone (primary) + customer name (secondary) in a gray box.
   - Fields: **Phone**, **Shipping Area** (chip), **Shipping Address** (boxed block).
   - Empty state if no `details`: "No details available" with icon.

3. **Device & Block card** — see `device-blocking.md` §6 (monospace device hash + IP,
   Blocked/Active pill, Block/Unblock buttons behind confirmation dialogs).

**Shared modal:** `src/components/ConfirmDialog.jsx` — fixed overlay (`bg-black/40`),
centered `max-w-sm` white panel, title + message + Cancel/Confirm, `variant="danger"`
renders a red confirm button, **Escape closes**, auto-focus on confirm button.

#### 🐘 Laravel port

- **Stack choice:** the original is a React SPA-style client component talking to server
  actions. In Laravel the closest 1:1 is **Inertia + React/Vue**, or **Livewire** if you
  prefer staying in Blade. The UI structure, columns, cards, and interaction rules above are
  what to replicate — not the framework plumbing.
- Client-side filtering → either replicate with an Alpine/Livewire-computed collection, or
  (simpler, recommended) do server-side filtering with query params:
  `?q={order_no|phone}&status={status}`.
- Instant-save selects: Livewire `wire:model.change` / Inertia `router.patch` + `Saved ✓`
  flash.
- Recreate `ConfirmDialog` as a Blade component (or use `x-on:click` + a small Alpine
  dialog): overlay, `max-w-sm` panel, danger variant, Esc-to-close.

---

## 8. Notifications (Telegram)

New orders trigger exactly one notification — a Telegram message. **No emails exist.**

`src/lib/telegram.js` → `sendOrderAlert({ orderNo, total, name, mobile, address, shippingArea, itemCount })`:

- Credentials read from the `SiteSetting` singleton row (`telegramBotToken`, `telegramChatId`;
  editable in admin `/admin/settings/site-config`, with a "test" endpoint). If missing →
  log warning and skip.
- Message template (exact):
  ```
  🛒 New order #{orderNo}!
  Customer: {name}
  Phone: {mobile}
  Area: {shippingArea}
  Total: ৳{total}
  Items: {itemCount}
  Address: {address}
  ```
- Sent to `https://api.telegram.org/bot{token}/sendMessage` with `disable_web_page_preview:
  true`. Failures logged, never surfaced to the customer.
- Called fire-and-forget from `POST /api/checkout` after the order is created.

#### 🐘 Laravel port

```php
// app/Jobs/SendOrderAlert.php — queued job (fire-and-forget)
$text = "🛒 New order #{$order->order_no}!\n"
     . "Customer: {$order->details->customer_name}\n"
     . "Phone: {$order->details->phone_number}\n"
     . "Area: {$order->details->shipping_area}\n"
     . "Total: ৳{$order->total}\n"
     . "Items: {$order->items->count()}\n"
     . "Address: {$order->details->shipping_address}";

Http::asJson()->post("https://api.telegram.org/bot{$token}/sendMessage", [
    'chat_id' => $chatId,
    'text' => $text,
    'disable_web_page_preview' => true,
]);
```

Store `telegram_bot_token` / `telegram_chat_id` in a `settings` table (singleton row) —
mirror of `SiteSetting`.

---

## 9. Storefront UI (customer-facing)

### 9.1 Cart

- **Persistence:** `localStorage`, key **`cabinet-closet-cart`** (`src/lib/cartStorage.js`).
- **Item shape:**
  ```js
  { productId, productSlug, sku, title, image, variantId, variantName, price, salePrice, quantity }
  ```
- **Merge rule:** `addToCart` merges duplicates by `productSlug + variantId` (increments qty).
- `updateCartItem(index, qty)` removes the entry when `qty <= 0`; `removeCartItem(index)`;
  `clearCart()`.
- Every mutation dispatches a **`cart-updated` window event** (used by the header drawer
  `src/components/storefront/CartDrawer.jsx` to live-update).
- **Cart page** (`app/(storefront)/cart/page.jsx`): quantity steppers, remove, subtotal,
  "Proceed to Checkout" → `/checkout`; fires GTM `view_cart`.
- Cart is SSR-safe: `loadCart()` returns `[]` on the server.

### 9.2 Checkout page — `/checkout` (`app/(storefront)/checkout/page.jsx`)

- **Layout:** single column on mobile; on `lg` a 2-column grid — form (`1fr`) + sticky-width
  **Order Summary** aside (`420px`), both in rounded-2xl bordered cards.
- **Form fields:** Name\*, Mobile\*, Address\* (textarea, 3 rows), Delivery radios —
  *"Inside Dhaka — 80 taka"* / *"Outside Dhaka — 120 taka"* (default: Inside Dhaka).
  Inline red field errors under each input; top-level red error banner for API errors.
- **Order Summary:** line items (56px image, title, `{variantName} × {qty}`, line total) +
  Subtotal / Delivery / Total.
- **Blocked-device check:** as soon as the fingerprint hash is available, calls
  `GET /api/checkout/check-blocked?deviceHash=…`; if `blocked: true` →
  `window.location.href = 'https://google.com'` (silent redirect, no message).
- **Empty cart:** friendly "Your cart is empty. Add items before checking out." state.
- **GTM events:** `begin_checkout` (once, after hydration) with `ecommerce` payload
  (`items[]`, `value` = subtotal+delivery, `currency: 'BDT'`, `shipping`).
- **On successful submit:**
  1. `POST /api/checkout` with `{ ...form, items: cart, deviceHash }`.
  2. Store the `purchase` payload in `sessionStorage` under **`gtm_purchase`**
     (`transaction_id`, `value`, `currency: 'BDT'`, `shipping`, `items[]`).
  3. `clearCart()`.
  4. Redirect to `/thankyou?orderNo={orderNo}`.
  5. Any API error → red banner with the server's `error` message (e.g. the block message).

### 9.3 Thank-you page — `/thankyou` (`app/(storefront)/thankyou/page.jsx`)

- Centered card: big **✓**, "Thank you for your order", *"Your order has been received and is
  being processed."*, **"Order No: {orderNo}"** (boxed, brand color),
  *"We will contact you shortly with shipping details."*, "Continue Shopping" button →
  `/categories`.
- Fires GTM **`purchase`** from the `sessionStorage['gtm_purchase']` payload, then removes it
  (one-shot).
- **There is no customer order-history / order-tracking page** — customers only ever see
  this confirmation screen.

---

## 10. Dashboard integration (`app/admin/dashboard/page.jsx`)

- **Stat cards:** Total Products · Categories · Orders · **Revenue** (revenue excludes
  `cancelled`; card links to `/admin/orders`). Data via `getDashboardStats()`.
- **Recent Orders panel:** last 5 orders via `getRecentOrders(5)` — table (desktop) /
  card list (mobile): Order no (link to detail) · Customer · StatusBadge (colored pill) ·
  Total · Date.
- Quick Actions: "View Orders" → `/admin/orders`.
- Sidebar entry (`app/admin/partials/AdminSidebar.jsx`): `{ label: 'Orders', href:
  '/admin/orders', icon: 'orders' }`.

> ⚠️ Cosmetic dead code: the dashboard `StatusBadge` contains color keys for `Shipped` /
> `Processed` — statuses never used anywhere in the app. Don't port them.

---

## 11. Gotchas & flags (decide before porting)

1. **Inside-Dhaka delivery charge mismatch:** UI shows **80**, API persists **50** (§4.2 step
   5 vs §4.3). Pick one value in Laravel; the GTM payloads use 80.
2. **No status-transition validation** — any status → any status.
3. **`updateOrderItemQuantity` lacks a server-side completed-order check** (only
   `deleteOrderItem` has one). Add it if you want parity + safety.
4. **Random 6-digit `orderNo` with no collision retry** — a collision throws a 500 (unique
   constraint). Use a retry loop (or ULID/sequence) in Laravel.
5. **No inventory deduction** on order placement.
6. **Totals are admin-editable** (qty, remove item, delivery charge) with automatic
   recomputation — the checkout total is just the starting point.
7. **No pagination** on the orders list (everything loads, client-side filtered).
8. **No customer order history/tracking**; the phone number in the confirmation Telegram
   message is the customer's contact channel.
9. **Order search REST route is `orderNo` only** (no phone), while the list-page search box
   matches both orderNo and phone.

---

## 12. Laravel porting checklist

- [ ] Migrations: `orders`, `order_details`, `order_items` (§2)
- [ ] Models `Order` / `OrderDetail` / `OrderItem` with UUIDs + decimal casts (§2)
- [ ] `OrderStatus` enum + the two business rules (completed lock, delivery-charge lock) (§3)
- [ ] `CheckoutController@store` with FormRequest rules, IP capture chain, guards, nested
      transaction, random `order_no` with retry (§4)
- [ ] Central `recalculateTotal()` used by quantity/delete/delivery-charge endpoints (§5)
- [ ] Admin routes + controller (index / show by order_no / status / quantity / delete item /
      details / search) behind admin middleware (§6)
- [ ] Admin UI: orders list (columns, filters, expandable rows) + order detail (items card
      with confirm-dialog steppers, instant status select, locked delivery charge, customer
      card) (§7)
- [ ] Telegram alert job + settings storage (§8)
- [ ] Storefront: cart storage + merge rules, checkout page w/ validation messages, blocked
      check, thank-you page + one-shot GTM purchase (§9)
- [ ] Dashboard stats (revenue excludes cancelled) + recent orders (§10)
- [ ] Decide & fix: delivery-charge value (80 vs 50), status-transition validation, quantity
      update guard on completed orders (§11)
