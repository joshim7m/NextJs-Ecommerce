# Admin Panel

## Purpose
Provide a simple CMS-style admin interface to manage categories and products.

## Features
- Admin authentication (session-based)
- Category CRUD (create, list, update, delete)
- Product CRUD with multiple images, variant attributes, base price, and sale price
- Order management with status updates and payment status tracking
- Basic search and filters in admin lists

## UI Patterns
- Use data tables for lists with inline actions (edit/delete)
- Use form pages or modals for create/edit workflows
- Product forms support variant definitions for size, color, prices, inventory, and variant images
- Order details pages show customer/shipping info, purchased items, and order totals
- Image upload will store URL references (for MVP, accept remote URLs or drag-and-drop that returns a URL)

## Security
- Admin routes and API endpoints must check session role and deny unauthorized access.
