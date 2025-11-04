# Auron Vault - Multi-Chain Crypto Wallet

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">
  <img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC">
</p>

A secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

## Features

- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet
- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced security
- **Non-Custodial**: You own your keys - we don't have access to your funds
- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko
- **Asset Management**: View balances, transfer assets, and manage multiple addresses
- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks
- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

## Platform Support

| Platform | Status |
|----------|--------|
| Android  |  Available |
| iOS      |  Coming Soon |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or newer)
- **npm** or **yarn**
- **Android Studio** (for Android development)
- **JDK 17** (required by React Native 0.76)
- **Android SDK** (API Level 34)

### Environment Setup

Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Auron-Vault/auron.git
cd auron
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# CoinGecko API (get free key from https://www.coingecko.com/en/api)
COIN_GECKO_API_KEY=your_api_key_here

# Security salts (generate random strings)
DEVELOPMENT_SALT=your_development_salt
PRODUCTION_SALT=your_production_salt

# Blockchain RPC URLs (use your Chainstack endpoints)
ETHEREUM_RPC_URL=https://your-ethereum-rpc.com
BSC_RPC_URL=https://your-bsc-rpc.com
SOLANA_RPC_URL=https://your-solana-rpc.com
BITCOIN_RPC_URL=https://your-bitcoin-rpc.com
```

## Running the App

### Development Mode

**Start Metro bundler:**

```bash
npm start
```

**Run on Android (in a new terminal):**

```bash
npm run android
```

Or build and run from Android Studio:

- Open `android/` folder in Android Studio
- Click **Run** or press `Shift + F10`

### Production Build

**Build an optimized APK:**

```bash
npm run android:release
```

**Build Android App Bundle (for Play Store):**

```bash
npm run android:bundle
```

The production build includes:

- ProGuard minification
- Resource shrinking
- Console.log removal
- APK splits by architecture (ARM, x86)

**Output locations:**

- APK: `android/app/build/outputs/apk/release/`
- AAB: `android/app/build/outputs/bundle/release/`

## Project Structure

```
auron/
 src/
    components/      # Reusable UI components
    screens/         # App screens (Dashboard, AssetDetail, etc.)
    navigation/      # React Navigation setup
    hooks/           # Custom React hooks (wallet creation)
    services/        # API services (CoinGecko, balances, transfers)
    context/         # React Context (WalletContext)
    utils/           # Utilities (caching, performance, transactions)
    constants/       # Constants (colors, fonts, assets)
    assets/          # Images, fonts, animations
 android/             # Android native code
 ios/                 # iOS native code (coming soon)
 .env                 # Environment variables (not in git)
```

## Security Features

- **Non-Custodial**: Private keys never leave your device
- **NFC Integration**: Deterministic wallet generation using NFC cards
- **BIP39 Compatible**: Standard mnemonic phrase support
- **Secure Storage**: Environment-based salt encryption
- **No Telemetry**: Your transaction data stays private

> [!WARNING]
> Always backup your NFC card and recovery phrase. Loss of both means permanent loss of funds.

## Supported Blockchain Networks

| Network | Symbol | Features |
|---------|--------|----------|
| Bitcoin | BTC | Native SegWit (Bech32) addresses |
| Ethereum | ETH | ERC-20 token support |
| Binance Smart Chain | BSC | BEP-20 token support |
| Solana | SOL | SPL token support |

## Development

### Code Quality

Run linter:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

### Testing

```bash
npm test
```

## Troubleshooting

### Android Build Issues

**Gradle build fails:**

```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Metro bundler cache issues:**

```bash
npm start -- --reset-cache
```

**NFC not working:**

- Ensure device supports NFC
- Enable NFC in Android settings
- Grant NFC permissions to the app

### Environment Variable Issues

If you see "undefined" for RPC URLs or API keys:

1. Ensure `.env` file exists in root directory
2. Restart Metro bundler after editing `.env`
3. Rebuild the app (not just reload)

## Coming Soon

-  **iOS Support** - Full iOS wallet with NFC
-  **Analytics Dashboard** - Transaction history and charts
-  **Token Swaps** - Built-in DEX integration
-  **DeFi Integration** - Staking and yield farming
-  **Multi-language Support**

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Links

- **Website**: [https://auron-vault.com/](https://auron-vault.com/)
- **Documentation**: Coming soon
- **Support**: Visit our website for support

## Disclaimer

Auron Vault is experimental software. Use at your own risk. Always backup your recovery phrases and NFC cards. The developers are not responsible for lost funds.

---

<p align="center">
  Built with  using React Native
</p>