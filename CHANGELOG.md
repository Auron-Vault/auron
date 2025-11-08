# Changelog

All notable changes to Auron Wallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-08

### Added

- Independent invoice payment system with direct execution
- Database integration for invoice management (fetch, mark paid, monitor)
- Transaction detail modal with copyable fields (addresses, hashes, invoice IDs)
- 3-tap NFC card validation system with deterministic wallet generation
- Real-time invoice status monitoring with callbacks
- Combined transaction history (regular transactions + invoices)
- Duplicate invoice filtering for self-paid invoices
- Smart balance validation before payment execution
- Payment progress messages (preparing, sending, updating, complete)
- USDC token account validation before transfers
- Private key management in TapToPayCard component
- API endpoints for invoice operations
- Development mode configuration (USE_DEV_MODE environment variable)

### Changed

- PayInvoiceModal now handles payment independently (removed TransferModal dependency)
- TapToPayCard simplified payment handling with direct callback
- Transaction history icon standardized to 'account-cash-outline'
- CoinGecko API rate limit updated to 10 requests/minute (from 30)
- Environment configuration extended with API_URL and dev mode settings
- Improved error messages in transfer service
- Enhanced console logging for debugging

### Fixed

- **Critical:** Duplicate invoice key error when user pays own invoice
- **Critical:** USDC transfer failures due to missing token account validation
- Unclear error messages in transfer service for failed transactions
- Rate limiting issues with CoinGecko free tier API
- Invoice status not updating in UI after payment
- Missing source token account checks in USDC transfers

### Removed

- TransferModal dependency from invoice payment flow
- Unused Invoice import from TapToPayCard component
- Redundant payment confirmation callbacks

### Security

- NFC card validation requires 3 consistent taps
- Production mode enforces real NFC scanning (no bypass)
- Private keys managed securely with automatic cleanup
- Card switching detection during validation (immediate failure)
- Validated cards cached to prevent replay attacks

### Technical

- 21 files changed
- 4,761 insertions (+)
- 449 deletions (-)
- APK sizes: 28-103 MB (architecture dependent)
- Build time: ~1 minute

## [0.0.2] - 2025-11-07

### Added

- Custom Alert component
- Tap-to-Pay components and functionality
- Enhanced wallet UI

## [0.0.1] - 2025-11-06

### Added

- Initial wallet implementation
- USDC (Solana) SPL token support
- Basic NFC functionality
- Wallet dashboard
- Transaction history

---

## Roadmap

### [0.2.0] - Planned

- Asset selection for invoices (SOL/USDC)
- Invoice expiration functionality
- Multi-signature support
- Invoice templates
- QR code invoice sharing
- Push notifications for payments

### [1.0.0] - Future

- Google Play Store release
- Signed production builds
- Multi-language support
- Advanced analytics
- Cloud backup
- Social features

---

## Version Guidelines

- **Major (x.0.0)**: Breaking changes, major features
- **Minor (0.x.0)**: New features, backwards compatible
- **Patch (0.0.x)**: Bug fixes, minor improvements

---
