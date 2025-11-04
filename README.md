# Auron Vault - Multi-Chain Crypto WalletThis is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

<p align="center"># Getting Started

  <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">

<img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript">> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

  <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">

<img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC">## Step 1: Start Metro

</p>

First, you will need to run **Metro**, the JavaScript build tool for React Native.

A secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

To start the Metro dev server, run the following command from the root of your React Native project:

🌐 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

````sh

## 🚀 Features# Using npm

npm start

- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet

- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced security# OR using Yarn

- **Non-Custodial**: You own your keys - we don't have access to your fundsyarn start

- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko```

- **Asset Management**: View balances, transfer assets, and manage multiple addresses

- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks## Step 2: Build and run your app

- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

## 📱 Platform Support

### Android

| Platform | Status |

|----------|--------|```sh

| Android  | ✅ Available |# Using npm

| iOS      | 🚧 Coming Soon |npm run android



## 🛠️ Prerequisites# OR using Yarn

yarn android

Before you begin, ensure you have the following installed:```



- **Node.js** (v18 or newer)### iOS

- **npm** or **yarn**

- **Android Studio** (for Android development)For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

- **JDK 17** (required by React Native 0.76)

- **Android SDK** (API Level 34)The first time you create a new project, run the Ruby bundler to install CocoaPods itself:



### Environment Setup```sh

bundle install

Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.```



## 📦 InstallationThen, and every time you update your native dependencies, run:



1. **Clone the repository**```sh

```bashbundle exec pod install

git clone https://github.com/yourusername/auron.git```

cd auron

```For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).



2. **Install dependencies**```sh

```bash# Using npm

npm installnpm run ios

````

# OR using Yarn

3. **Configure environment variables**yarn ios

````

Create a `.env` file in the root directory:

```bashIf everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

cp .env.example .env

```This is one way to run your app — you can also build it directly from Android Studio or Xcode.



Edit `.env` and add your configuration:## Step 3: Modify your app

```env

# CoinGecko API (get free key from https://www.coingecko.com/en/api)Now that you have successfully run the app, let's make changes!

COIN_GECKO_API_KEY=your_api_key_here

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

# Security salts (generate random strings)

DEVELOPMENT_SALT=your_development_saltWhen you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

PRODUCTION_SALT=your_production_salt

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).

# Blockchain RPC URLs (use your Chainstack endpoints)- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

ETHEREUM_RPC_URL=https://your-ethereum-rpc.com

BSC_RPC_URL=https://your-bsc-rpc.com## Congratulations! :tada:

SOLANA_RPC_URL=https://your-solana-rpc.com

BITCOIN_RPC_URL=https://your-bitcoin-rpc.comYou've successfully run and modified your React Native App. :partying_face:

````

### Now what?

## 🏃 Running the App

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).

### Development Mode- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

1. **Start Metro bundler**# Troubleshooting

```bash

npm startIf you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

```

# Learn More

2. **Run on Android (in a new terminal)**

````bashTo learn more about React Native, take a look at the following resources:

npm run android

```- [React Native Website](https://reactnative.dev) - learn more about React Native.

- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.

Or build and run from Android Studio:- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.

- Open `android/` folder in Android Studio- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.

- Click **Run** or press `Shift + F10`- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.


### Production Build

Build an optimized APK:
```bash
npm run android:release
````

Build Android App Bundle (for Play Store):

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

## 📁 Project Structure

```
auron/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens (Dashboard, AssetDetail, etc.)
│   ├── navigation/      # React Navigation setup
│   ├── hooks/           # Custom React hooks (wallet creation)
│   ├── services/        # API services (CoinGecko, balances, transfers)
│   ├── context/         # React Context (WalletContext)
│   ├── utils/           # Utilities (caching, performance, transactions)
│   ├── constants/       # Constants (colors, fonts, assets)
│   └── assets/          # Images, fonts, animations
├── android/             # Android native code
├── ios/                 # iOS native code (coming soon)
└── .env                 # Environment variables (not in git)
```

## 🔐 Security Features

- **Non-Custodial**: Private keys never leave your device
- **NFC Integration**: Deterministic wallet generation using NFC cards
- **BIP39 Compatible**: Standard mnemonic phrase support
- **Secure Storage**: Environment-based salt encryption
- **No Telemetry**: Your transaction data stays private

⚠️ **Important**: Always backup your NFC card and recovery phrase. Loss of both means permanent loss of funds.

## 🔧 Supported Blockchain Networks

| Network             | Symbol | Features                         |
| ------------------- | ------ | -------------------------------- |
| Bitcoin             | BTC    | Native SegWit (Bech32) addresses |
| Ethereum            | ETH    | ERC-20 token support             |
| Binance Smart Chain | BSC    | BEP-20 token support             |
| Solana              | SOL    | SPL token support                |

## 📊 Development

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

## 🐛 Troubleshooting

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

## 🚀 Coming Soon

- 📱 **iOS Support** - Full iOS wallet with NFC
- 📊 **Analytics Dashboard** - Transaction history and charts
- 🔄 **Token Swaps** - Built-in DEX integration
- 💰 **DeFi Integration** - Staking and yield farming
- 🌍 **Multi-language Support**

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Website**: [https://auron-vault.com/](https://auron-vault.com/)
- **Documentation**: Coming soon
- **Support**: Visit our website for support

## ⚠️ Disclaimer

Auron Vault is experimental software. Use at your own risk. Always backup your recovery phrases and NFC cards. The developers are not responsible for lost funds.

---

Built with ❤️ using React Native
