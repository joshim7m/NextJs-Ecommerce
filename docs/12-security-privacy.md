# Security & Privacy

## Secrets
- Never commit secrets. Use environment variables for database and auth secrets.

## Admin Security
- Use strong password hashing (bcrypt/argon2) and session cookies.
- Rate-limit auth endpoints and apply role checks on every admin API.

## Privacy
- Provide Privacy Policy and Terms pages; implement cookie consent for analytics.

## Data Protection
- Back up the database and protect backups with access controls.
