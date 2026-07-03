# Data Model

This file describes the conceptual data model for the ecommerce catalog. The exact Prisma schema will follow this layout.

## Entities

- **Category**
  - id (UUID)
  - name
  - slug
  - image
  - parentCategoryId (nullable)
  - description
  - createdAt, updatedAt

- **Product**
  - id (UUID)
  - title
  - slug
  - description (rich text/Markdown)
  - Unite_price (decimal) — base product price used when product has no variants
  - sale_price (decimal, optional) — base sale price used when product has no variants
  - inventoryQuantity (optional for base product; variant-level inventory preferred)
  - status (publish, draft)
  - categories (relation, many-to-many)
  - createdAt, updatedAt

- **ProductImage**
  - id
  - productId
  - image_path
  - altText(string, optional)

- **ProductVariant**
  - id (UUID)
  - productId (FK)
  - sku (optional)
  - size (string, optional) — e.g., S, M, L
  - color (string, optional) — e.g., Black, Oak
  - unit_price (decimal, optional) — if set, this overrides the product base `price` for this variant
  - sale_price (decimal, optional) — discounted price for this variant; admin can set both `price` and `sale_price`
  - imageId (optional FK to ProductImage) — variant-specific image
  - inventoryQuantity (integer)
  - isDefault (boolean) — designates default variant when needed
  - createdAt, updatedAt

Notes on pricing/selection behavior:
- If a product has one or more `ProductVariant` records, the storefront MUST show the product as a variant-selectable product — customers choose size/color before adding to cart.
- For varianted products, price shown to the customer comes from the selected `ProductVariant.price` (or `ProductVariant.sale_price` when present).
- If a product has no variants, the storefront shows the base `Product.price` (or `Product.sale_price` when present).
- Admin enters two prices where applicable: `price` and `sale_price`. The displayed discount is calculated as `discount_amount = price - sale_price`.
- Additionally, display a discount percentage where helpful: `discount_percent = ((price - sale_price) / price) * 100` (guard against division by zero).

- **User (Admin)**
  - id
  - name
  - email
  - passwordHash
  - role (admin|editor)

- **User (Customer)**
  - id (UUID)
  - name
  - email
  - passwordHash
  - createdAt, updatedAt

- **UserDetails**
  - id (UUID)
  - userId (FK to User/Customer)
  - phoneNumber
  - shippingAddress
  - createdAt, updatedAt

- **Order**
  - id (UUID)
  - orderNo (string)
  - userId (nullable FK to User/Customer)
  - total_amount (decimal)
  - orderStatus (enum: pending, processing, completed, cancelled)
  - paymentStatus (enum: paid, unpaid, refund)
  - createdAt, updatedAt

- **OrderDetails**
  - id (UUID)
  - orderId (FK)
  - userId (nullable FK to User/Customer)
  - phoneNumber
  - shippingAddress
  - createdAt, updatedAt

- **OrderItem**
  - id (UUID)
  - orderId (FK)
  - productTitle
  - itemImagePath
  - purchasePrice (decimal)
  - quantity (integer)
  - createdAt, updatedAt

