# Security Specification - All Service BD

## Data Invariants
1. `homepage_content/main` is the single source of truth for dynamic UI text and featured services.
2. `categories` are managed by admins and read by all users.
3. `bookings` are created by customers (authenticated or guest) and managed by admins.
4. `orders` are created by customers during checkout and managed by admins.
5. `config/site` controls global flags like maintenance mode.

## The "Dirty Dozen" Payloads

1. **Admin Spoofing**: Attempting to update `homepage_content` as a non-admin.
2. **Invalid Type**: Sending a number for `heroTitle` in `homepage_content`.
3. **Oversized String**: Sending a 5KB string for `heroSubtitle`.
4. **Shadow Field Injection**: Adding an `isAdmin: true` field to a booking document.
5. **Unauthorized Deletion**: Attempting to delete the `homepage_content/main` document.
6. **State Skip**: Directly creating a booking with `status: 'completed'`.
7. **Identity Theft**: Creating an order where `customerPhone` doesn't match the provided format.
8. **Resource Poisoning**: Creating 10,000 dummy bookings in a single batch (protected by rate limits and collection-level rules).
9. **PII Leak**: A guest user trying to list all `bookings` (denied: only admins can list).
10. **Immutable Field Change**: Attempting to change `createdAt` or `bookingId` on an existing booking.
11. **Malicious Regex**: Sending an invalid ID format for a category.
12. **Timestamp Forgery**: Sending a client-side timestamp instead of `serverTimestamp()`.

## Security Strategy
- **Homepage & Categories**: Public read, Admin write.
- **Bookings & Orders**: Public create (write-only for guest/owner), Admin read/write.
- **Config**: Public read (specifically `maintenanceMode`), Admin write.
