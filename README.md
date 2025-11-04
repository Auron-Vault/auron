# Auron Vault - Multi-Chain Crypto Wallet# Auron Vault - Multi-Chain Crypto WalletThis is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

<p align="center"><p align="center"># Getting Started

  <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">

<img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript"> <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">

  <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">

<img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC"><img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript">> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

</p>

  <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">

A secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

<img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC">## Step 1: Start Metro

🌐 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

</p>

---

First, you will need to run **Metro**, the JavaScript build tool for React Native.

## 🚀 Features

A secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet

- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced securityTo start the Metro dev server, run the following command from the root of your React Native project:

- **Non-Custodial**: You own your keys - we don't have access to your funds

- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko🌐 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

- **Asset Management**: View balances, transfer assets, and manage multiple addresses

- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks````sh

- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

## 🚀 Features# Using npm

---

npm start

## 📱 Platform Support

- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet

| Platform | Status |

|----------|--------|- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced security# OR using Yarn

| Android | ✅ Available |

| iOS | 🚧 Coming Soon |- **Non-Custodial**: You own your keys - we don't have access to your fundsyarn start

---- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko```

## 🛠️ Prerequisites- **Asset Management**: View balances, transfer assets, and manage multiple addresses

Before you begin, ensure you have the following installed:- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks## Step 2: Build and run your app

- **Node.js** (v18 or newer)- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

- **npm** or **yarn**

- **Android Studio** (for Android development)With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

- **JDK 17** (required by React Native 0.76)

- **Android SDK** (API Level 34)## 📱 Platform Support

### Environment Setup### Android

Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.| Platform | Status |

---|----------|--------|```sh

## 📦 Installation| Android | ✅ Available |# Using npm

### 1. Clone the repository| iOS | 🚧 Coming Soon |npm run android

```bash

git clone https://github.com/Auron-Vault/auron.git

cd auron## 🛠️ Prerequisites# OR using Yarn

```

yarn android

### 2. Install dependencies

Before you begin, ensure you have the following installed:```

```bash

npm install

```

- **Node.js** (v18 or newer)### iOS

### 3. Configure environment variables

- **npm** or **yarn**

Create a `.env` file in the root directory:

- **Android Studio** (for Android development)For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

```bash

cp .env.example .env- **JDK 17** (required by React Native 0.76)

```

- **Android SDK** (API Level 34)The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

Edit `.env` and add your configuration:

````env

# CoinGecko API (get free key from https://www.coingecko.com/en/api)### Environment Setup```sh

COIN_GECKO_API_KEY=your_api_key_here

bundle install

# Security salts (generate random strings)

DEVELOPMENT_SALT=your_development_saltComplete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.```

PRODUCTION_SALT=your_production_salt



# Blockchain RPC URLs (use your Chainstack endpoints)

ETHEREUM_RPC_URL=https://your-ethereum-rpc.com## 📦 InstallationThen, and every time you update your native dependencies, run:

BSC_RPC_URL=https://your-bsc-rpc.com

SOLANA_RPC_URL=https://your-solana-rpc.com

BITCOIN_RPC_URL=https://your-bitcoin-rpc.com

```1. **Clone the repository**```sh



---```bashbundle exec pod install



## 🏃 Running the Appgit clone https://github.com/yourusername/auron.git```



### Development Modecd auron



**1. Start Metro bundler**```For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).



```bash

npm start

```2. **Install dependencies**```sh



**2. Run on Android (in a new terminal)**```bash# Using npm



```bashnpm installnpm run ios

npm run android

````

Or build and run from Android Studio:# OR using Yarn

- Open `android/` folder in Android Studio

- Click **Run** or press `Shift + F10`3. **Configure environment variables**yarn ios

### Production Build````

**Build an optimized APK:**Create a `.env` file in the root directory:

`bash`bashIf everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

npm run android:release

`````cp .env.example .env



**Build Android App Bundle (for Play Store):**```This is one way to run your app — you can also build it directly from Android Studio or Xcode.



```bash

npm run android:bundle

```Edit `.env` and add your configuration:## Step 3: Modify your app



The production build includes:```env

- ✅ ProGuard minification

- ✅ Resource shrinking# CoinGecko API (get free key from https://www.coingecko.com/en/api)Now that you have successfully run the app, let's make changes!

- ✅ Console.log removal

- ✅ APK splits by architecture (ARM, x86)COIN_GECKO_API_KEY=your_api_key_here



**Output locations:**Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

- APK: `android/app/build/outputs/apk/release/`

- AAB: `android/app/build/outputs/bundle/release/`# Security salts (generate random strings)



---DEVELOPMENT_SALT=your_development_saltWhen you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:



## 📁 Project StructurePRODUCTION_SALT=your_production_salt



```- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).

auron/

├── src/# Blockchain RPC URLs (use your Chainstack endpoints)- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

│   ├── components/      # Reusable UI components

│   ├── screens/         # App screens (Dashboard, AssetDetail, etc.)ETHEREUM_RPC_URL=https://your-ethereum-rpc.com

│   ├── navigation/      # React Navigation setup

│   ├── hooks/           # Custom React hooks (wallet creation)BSC_RPC_URL=https://your-bsc-rpc.com## Congratulations! :tada:

│   ├── services/        # API services (CoinGecko, balances, transfers)

│   ├── context/         # React Context (WalletContext)SOLANA_RPC_URL=https://your-solana-rpc.com

│   ├── utils/           # Utilities (caching, performance, transactions)

│   ├── constants/       # Constants (colors, fonts, assets)BITCOIN_RPC_URL=https://your-bitcoin-rpc.comYou've successfully run and modified your React Native App. :partying_face:

│   └── assets/          # Images, fonts, animations

├── android/             # Android native code````

├── ios/                 # iOS native code (coming soon)

└── .env                 # Environment variables (not in git)### Now what?

`````

## 🏃 Running the App

---

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).

## 🔐 Security Features

### Development Mode- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

- **Non-Custodial**: Private keys never leave your device

- **NFC Integration**: Deterministic wallet generation using NFC cards1. **Start Metro bundler**# Troubleshooting

- **BIP39 Compatible**: Standard mnemonic phrase support

- **Secure Storage**: Environment-based salt encryption```bash

- **No Telemetry**: Your transaction data stays private

npm startIf you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

> ⚠️ **Important**: Always backup your NFC card and recovery phrase. Loss of both means permanent loss of funds.

`````

---

# Learn More

## 🔧 Supported Blockchain Networks

2. **Run on Android (in a new terminal)**

| Network | Symbol | Features |

|---------|--------|----------|````bashTo learn more about React Native, take a look at the following resources:

| Bitcoin | BTC | Native SegWit (Bech32) addresses |

| Ethereum | ETH | ERC-20 token support |npm run android

| Binance Smart Chain | BSC | BEP-20 token support |

| Solana | SOL | SPL token support |```- [React Native Website](https://reactnative.dev) - learn more about React Native.



---- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.



## 📊 DevelopmentOr build and run from Android Studio:- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.



### Code Quality- Open `android/` folder in Android Studio- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.



Run linter:- Click **Run** or press `Shift + F10`- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.



```bash

npm run lint### Production Build

`````

Build an optimized APK:

Fix auto-fixable issues:```bash

npm run android:release

```bash````

npm run lint -- --fix

````Build Android App Bundle (for Play Store):



### Testing```bash

npm run android:bundle

```bash```

npm test

```The production build includes:



---- ProGuard minification

- Resource shrinking

## 🐛 Troubleshooting- Console.log removal

- APK splits by architecture (ARM, x86)

### Android Build Issues

**Output locations:**

**Gradle build fails:**

- APK: `android/app/build/outputs/apk/release/`

```bash- AAB: `android/app/build/outputs/bundle/release/`

cd android

./gradlew clean## 📁 Project Structure

cd ..

npm run android```

```auron/

├── src/

**Metro bundler cache issues:**│   ├── components/      # Reusable UI components

│   ├── screens/         # App screens (Dashboard, AssetDetail, etc.)

```bash│   ├── navigation/      # React Navigation setup

npm start -- --reset-cache│   ├── hooks/           # Custom React hooks (wallet creation)

```│   ├── services/        # API services (CoinGecko, balances, transfers)

│   ├── context/         # React Context (WalletContext)

**NFC not working:**│   ├── utils/           # Utilities (caching, performance, transactions)

- Ensure device supports NFC│   ├── constants/       # Constants (colors, fonts, assets)

- Enable NFC in Android settings│   └── assets/          # Images, fonts, animations

- Grant NFC permissions to the app├── android/             # Android native code

├── ios/                 # iOS native code (coming soon)

### Environment Variable Issues└── .env                 # Environment variables (not in git)

````

If you see "undefined" for RPC URLs or API keys:

1. Ensure `.env` file exists in root directory## 🔐 Security Features

2. Restart Metro bundler after editing `.env`

3. Rebuild the app (not just reload)- **Non-Custodial**: Private keys never leave your device

- **NFC Integration**: Deterministic wallet generation using NFC cards

---- **BIP39 Compatible**: Standard mnemonic phrase support

- **Secure Storage**: Environment-based salt encryption

## 🚀 Coming Soon- **No Telemetry**: Your transaction data stays private

- 📱 **iOS Support** - Full iOS wallet with NFC⚠️ **Important**: Always backup your NFC card and recovery phrase. Loss of both means permanent loss of funds.

- 📊 **Analytics Dashboard** - Transaction history and charts

- 🔄 **Token Swaps** - Built-in DEX integration## 🔧 Supported Blockchain Networks

- 💰 **DeFi Integration** - Staking and yield farming

- 🌍 **Multi-language Support**| Network | Symbol | Features |

| ------------------- | ------ | -------------------------------- |

---| Bitcoin | BTC | Native SegWit (Bech32) addresses |

| Ethereum | ETH | ERC-20 token support |

## 🤝 Contributing| Binance Smart Chain | BSC | BEP-20 token support |

| Solana | SOL | SPL token support |

We welcome contributions! Please:

## 📊 Development

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)### Code Quality

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)Run linter:

5. Open a Pull Request

```bash

---npm run lint

```

## 📄 License

Fix auto-fixable issues:

This project is licensed under the MIT License.

```bash

---npm run lint -- --fix

```

## 🔗 Links

### Testing

- **Website**: [https://auron-vault.com/](https://auron-vault.com/)

- **Documentation**: Coming soon```bash

- **Support**: Visit our website for supportnpm test

````

---

## 🐛 Troubleshooting

## ⚠️ Disclaimer

### Android Build Issues

Auron Vault is experimental software. Use at your own risk. Always backup your recovery phrases and NFC cards. The developers are not responsible for lost funds.

**Gradle build fails:**

---

```bash

<p align="center">cd android

  Built with ❤️ using React Native./gradlew clean

</p>cd ..

npm run android
````

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
