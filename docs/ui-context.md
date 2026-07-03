# UI Context & Design System

This document defines the visual design language, component library, and user experience guidelines for the Cabinet Closet ecommerce application.

## Design System Foundation

### Color Palette
- **Primary:** TBD (define Tailwind primary color)
- **Secondary:** TBD (define Tailwind secondary color)
- **Neutral:** Tailwind gray scale (50, 100, 200, 300, 400, 500, 600, 700, 800, 900)
- **Success:** Green (from Tailwind)
- **Warning:** Amber (from Tailwind)
- **Error/Danger:** Red (from Tailwind)

### Typography
- **Font Family:** System default or defined in `tailwind.config.js`
- **Headings:** Scales (text-4xl, text-3xl, text-2xl, text-xl, text-lg)
- **Body Text:** text-base (16px), text-sm for secondary info
- **Semantic Styling:** Bold for prices, muted for secondary info

### Spacing
- Use Tailwind spacing scale: px, 2, 3, 4, 6, 8, 12, 16, 20, 24, etc.
- Consistent padding and margin across components
- Maintain visual rhythm with repeated spacing values

## Component Library

### Storefront Components (JSX + Tailwind)
**Core Components:**
- `Header` – Logo, navigation, search bar, cart icon
- `Footer` – Links, contact info, regional info (Bangladesh focus)
- `ProductCard` – Image, title, price, sale price, discount badge
- `ProductGallery` – Image gallery with zoom, thumbnails
- `VariantSelector` – Select size/color, show variant-specific price and inventory
- `ProductGrid` – Responsive grid layout for product lists
- `FilterSidebar` – Category filters, price range, sorting
- `CartModal` – Mini-cart drawer or modal preview
- `CheckoutForm` – Customer info, shipping address, delivery charge selection

### Admin Components (JSX + TailwindCSS + ShadCN UI)
**Admin-Specific Components:**
- `DataTable` – Reusable table with sorting, filtering, actions
- `FormField` – Label, input, error handling
- `Modal` – Create/edit dialogs
- `ConfirmDialog` – Confirm delete actions
- `ImageUpload` – Drag-and-drop or file picker for product images
- `VariantTable` – Inline variant editor with size, color, price, inventory
- `StatusBadge` – Show order status, payment status, product status (draft/publish)

## Visual Patterns

### Glassmorphism (Optional)
- Use semi-transparent backgrounds with blur for premium feel
- Apply sparingly to headers, cards, or modal overlays
- Maintain accessibility with sufficient contrast

### Dark Mode
- Support dark mode preference (Tailwind dark: class)
- Ensure all colors meet WCAG AA contrast standards in both light and dark modes
- Provide toggle in settings/profile

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Product grids: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
- Admin UI: 1 column (mobile), full-width (tablet+)

### Interactive States
- Hover: Subtle color change, shadow, or scale
- Focus: Clear focus ring (Tailwind focus: ring)
- Active: Distinct background or border change
- Disabled: Reduced opacity, disabled cursor

## Branding & Regional Considerations

### Bangladesh Focus
- Use local language (Bengali) in secondary places (labels, help text) — English for MVP
- Display prices in BDT with ৳ symbol where applicable
- Show "Dhaka" vs "Outside Dhaka" shipping prominently
- Include Bengali contact information in footer (future localization)

### Product Presentation
- High-quality product images with consistent aspect ratios
- Clear pricing hierarchy: original price (strikethrough if on sale), sale price, discount %
- Variant badges (color swatches, size labels)
- Stock status: in-stock (green), low-stock (amber), out-of-stock (gray/disabled)

## User Experience Guidelines

### Storefront UX
- **Discovery:** Category navigation, product search, filters
- **Product Detail:** Image gallery, variant selection, quantity, add-to-cart CTA
- **Cart:** Review items, update quantity, remove items, proceed to checkout
- **Checkout:** Multi-step or single-page form with address validation
- **Order Confirmation:** Order number, estimated delivery, tracking (future)

### Admin UX
- **Navigation:** Sidebar or top nav with clear sections (Dashboard, Categories, Products, Orders)
- **Forms:** Clear labels, validation messages, save/cancel buttons
- **Lists:** Search, filters, sortable columns, pagination, bulk actions (future)
- **Feedback:** Toast notifications for success/error, loading states

## Accessibility

### WCAG 2.1 AA Compliance
- Keyboard navigation: Tab order, Enter/Space activation
- Screen reader support: Semantic HTML, ARIA labels where needed
- Color contrast: Minimum 4.5:1 for text, 3:1 for graphical elements
- Form accessibility: Associated labels, error messages linked to inputs

### Best Practices
- Use semantic HTML (nav, article, section, etc.)
- Provide alt text for all images
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Test with screen readers (NVDA, JAWS)

## Implementation Notes

### Tailwind Configuration
- Customize `tailwind.config.js` with project colors, fonts, and spacing
- Use CSS variables for theming if needed
- Define dark mode strategy (class-based or system preference)

### Component Patterns
- Keep components small and focused
- Pass styling through className props when flexibility is needed
- Use composition for complex UIs
- Avoid inline styles; use Tailwind utilities

### Performance
- Lazy-load images with Next.js Image component
- Use dynamic imports for large admin components
- Optimize bundle size by tree-shaking unused ShadCN components

## Future Enhancements
- Localization (Bengali language support)
- Advanced theme customization
- Animated transitions and micro-interactions
- Custom product filters (advanced)
- Mobile app version