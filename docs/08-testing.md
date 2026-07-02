# Testing & QA

## Unit & Component Tests
- Use Jest + React Testing Library for components and utilities.

## Integration Tests
- Test API routes and Prisma queries with a test database (Docker Postgres or SQLite).

## E2E
- Use Playwright or Cypress for critical user flows: browse, add-to-cart, admin CRUD.

## Accessibility
- Integrate `axe-core` checks in CI and run manual checks for keyboard navigation.

## CI
- GitHub Actions: lint, type-check, unit tests, build. Optionally run E2E on a matrix for major branches.
