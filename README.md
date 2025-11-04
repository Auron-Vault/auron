# Auron Vault - Multi-Chain Crypto Wallet# Auron Vault - Multi-Chain Crypto Wallet# Auron Vault - Multi-Chain Crypto Wallet# Auron Vault - Multi-Chain Crypto WalletThis is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

<p align="center"><p align="center"><p align="center"><p align="center"># Getting Started

  <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">

<img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript"> <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">

  <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">

<img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC"><img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript"> <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">

</p>

  <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">

A secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

<img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC"><img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript"> <img src="https://img.shields.io/badge/React%20Native-0.76-blue.svg" alt="React Native">

🌐 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

</p>

## Features

  <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">

- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet

- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced securityA secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

- **Non-Custodial**: You own your keys - we don't have access to your funds

- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko<img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC"><img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript">> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

- **Asset Management**: View balances, transfer assets, and manage multiple addresses

- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks🌐 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

</p>

## Platform Support

---

| Platform | Status |

|----------|--------| <img src="https://img.shields.io/badge/Platform-Android-green.svg" alt="Android">

| Android | ✅ Available |

| iOS | 🚧 Coming Soon |## 🚀 Features

## PrerequisitesA secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

Before you begin, ensure you have the following installed:- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet

- **Node.js** (v18 or newer)- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced security<img src="https://img.shields.io/badge/NFC-Enabled-orange.svg" alt="NFC">## Step 1: Start Metro

- **npm** or **yarn**

- **Android Studio** (for Android development)- **Non-Custodial**: You own your keys - we don't have access to your funds

- **JDK 17** (required by React Native 0.76)

- **Android SDK** (API Level 34)- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko🌐 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

### Environment Setup- **Asset Management**: View balances, transfer assets, and manage multiple addresses

Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks</p>

## Installation- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

### 1. Clone the repository---

```bash---

git clone https://github.com/Auron-Vault/auron.git

cd auronFirst, you will need to run **Metro**, the JavaScript build tool for React Native.

```

## 📱 Platform Support

### 2. Install dependencies

## 🚀 Features

```bash

npm install| Platform | Status |

```

|----------|--------|A secure, non-custodial multi-chain cryptocurrency wallet built with React Native. Auron Vault supports Bitcoin, Ethereum, Binance Smart Chain (BSC), and Solana - all secured through innovative NFC card technology.

### 3. Configure environment variables

| Android | ✅ Available |

Create a `.env` file in the root directory:

| iOS | 🚧 Coming Soon |- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet

```bash

cp .env.example .env---- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced securityTo start the Metro dev server, run the following command from the root of your React Native project:

```

## 🛠️ Prerequisites- **Non-Custodial**: You own your keys - we don't have access to your funds

Edit `.env` and add your configuration:

Before you begin, ensure you have the following installed:- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko🌐 **Website**: [https://auron-vault.com/](https://auron-vault.com/)

`````env

# CoinGecko API (get free key from https://www.coingecko.com/en/api)- **Node.js** (v18 or newer)- **Asset Management**: View balances, transfer assets, and manage multiple addresses

COIN_GECKO_API_KEY=your_api_key_here

- **npm** or **yarn**

# Security salts (generate random strings)

DEVELOPMENT_SALT=your_development_salt- **Android Studio** (for Android development)- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks````sh

PRODUCTION_SALT=your_production_salt

- **JDK 17** (required by React Native 0.76)

# Blockchain RPC URLs (use your Chainstack endpoints)

ETHEREUM_RPC_URL=https://your-ethereum-rpc.com- **Android SDK** (API Level 34)- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

BSC_RPC_URL=https://your-bsc-rpc.com

SOLANA_RPC_URL=https://your-solana-rpc.com### Environment Setup## 🚀 Features# Using npm

BITCOIN_RPC_URL=https://your-bitcoin-rpc.com

```Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.---



## Running the App---npm start



### Development Mode## 📦 Installation## 📱 Platform Support



**Start Metro bundler:**### 1. Clone the repository- **Multi-Chain Support**: Bitcoin, Ethereum, BSC, and Solana in one wallet



```bash```bash| Platform | Status |

npm start

```git clone https://github.com/Auron-Vault/auron.git



**Run on Android (in a new terminal):**cd auron|----------|--------|- **NFC Security**: Generate deterministic wallets using NFC cards for enhanced security# OR using Yarn



```bash```

npm run android

```| Android | ✅ Available |



Or build and run from Android Studio:### 2. Install dependencies



- Open `android/` folder in Android Studio| iOS | 🚧 Coming Soon |- **Non-Custodial**: You own your keys - we don't have access to your fundsyarn start

- Click **Run** or press `Shift + F10`

````bash

### Production Build

npm install---- **Real-time Prices**: Live cryptocurrency prices powered by CoinGecko```

**Build an optimized APK:**

`````

```bash

npm run android:release## 🛠️ Prerequisites- **Asset Management**: View balances, transfer assets, and manage multiple addresses

```

### 3. Configure environment variables

**Build Android App Bundle (for Play Store):**

Before you begin, ensure you have the following installed:- **Dedicated RPC Nodes**: Chainstack infrastructure with public fallbacks## Step 2: Build and run your app

```bash

npm run android:bundleCreate a `.env` file in the root directory:

```

- **Node.js** (v18 or newer)- **Production Optimized**: ProGuard minification, resource shrinking, and APK splits

The production build includes:

````````bash

- ProGuard minification

- Resource shrinkingcp .env.example .env- **npm** or **yarn**

- Console.log removal

- APK splits by architecture (ARM, x86)```



**Output locations:**- **Android Studio** (for Android development)With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:



- APK: `android/app/build/outputs/apk/release/`Edit `.env` and add your configuration:

- AAB: `android/app/build/outputs/bundle/release/`

- **JDK 17** (required by React Native 0.76)

## Project Structure

```````env

````````

auron/# CoinGecko API (get free key from https://www.coingecko.com/en/api)- **Android SDK** (API Level 34)## 📱 Platform Support

├── src/

│ ├── components/ # Reusable UI componentsCOIN_GECKO_API_KEY=your_api_key_here

│ ├── screens/ # App screens (Dashboard, AssetDetail, etc.)

│ ├── navigation/ # React Navigation setup### Environment Setup### Android

│ ├── hooks/ # Custom React hooks (wallet creation)

│ ├── services/ # API services (CoinGecko, balances, transfers)# Security salts (generate random strings)

│ ├── context/ # React Context (WalletContext)

│ ├── utils/ # Utilities (caching, performance, transactions)DEVELOPMENT_SALT=your_development_saltComplete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.| Platform | Status |

│ ├── constants/ # Constants (colors, fonts, assets)

│ └── assets/ # Images, fonts, animationsPRODUCTION_SALT=your_production_salt

├── android/ # Android native code

├── ios/ # iOS native code (coming soon)---|----------|--------|```sh

└── .env # Environment variables (not in git)

```````# Blockchain RPC URLs (use your Chainstack endpoints)



## Security FeaturesETHEREUM_RPC_URL=https://your-ethereum-rpc.com## 📦 Installation| Android | ✅ Available |# Using npm



- **Non-Custodial**: Private keys never leave your deviceBSC_RPC_URL=https://your-bsc-rpc.com

- **NFC Integration**: Deterministic wallet generation using NFC cards

- **BIP39 Compatible**: Standard mnemonic phrase supportSOLANA_RPC_URL=https://your-solana-rpc.com### 1. Clone the repository| iOS | 🚧 Coming Soon |npm run android

- **Secure Storage**: Environment-based salt encryption

- **No Telemetry**: Your transaction data stays privateBITCOIN_RPC_URL=https://your-bitcoin-rpc.com



> [!WARNING]``````bash

> Always backup your NFC card and recovery phrase. Loss of both means permanent loss of funds.



## Supported Blockchain Networks

---git clone https://github.com/Auron-Vault/auron.git

| Network | Symbol | Features |

|---------|--------|----------|

| Bitcoin | BTC | Native SegWit (Bech32) addresses |

| Ethereum | ETH | ERC-20 token support |## 🏃 Running the Appcd auron## 🛠️ Prerequisites# OR using Yarn

| Binance Smart Chain | BSC | BEP-20 token support |

| Solana | SOL | SPL token support |



## Development### Development Mode```



### Code Quality



Run linter:**1. Start Metro bundler**yarn android



```bash

npm run lint

``````bash### 2. Install dependencies



Fix auto-fixable issues:npm start



```bash```Before you begin, ensure you have the following installed:```

npm run lint -- --fix

```````

### Testing**2. Run on Android (in a new terminal)**```bash

````````bash

npm test

``````bashnpm install



## Troubleshootingnpm run android



### Android Build Issues```````



**Gradle build fails:**Or build and run from Android Studio:- **Node.js** (v18 or newer)### iOS



```bash- Open `android/` folder in Android Studio

cd android

./gradlew clean- Click **Run** or press `Shift + F10`### 3. Configure environment variables

cd ..

npm run android### Production Build- **npm** or **yarn**

````````

**Build an optimized APK:**Create a `.env` file in the root directory:

**Metro bundler cache issues:**

```````bash- **Android Studio** (for Android development)For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

```bash

npm start -- --reset-cachenpm run android:release

```

``````bash

**NFC not working:**



- Ensure device supports NFC

- Enable NFC in Android settings**Build Android App Bundle (for Play Store):**cp .env.example .env- **JDK 17** (required by React Native 0.76)

- Grant NFC permissions to the app



### Environment Variable Issues

```bash```

If you see "undefined" for RPC URLs or API keys:

npm run android:bundle

1. Ensure `.env` file exists in root directory

2. Restart Metro bundler after editing `.env````- **Android SDK** (API Level 34)The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

3. Rebuild the app (not just reload)



## Coming Soon

The production build includes:Edit `.env` and add your configuration:

- 📱 **iOS Support** - Full iOS wallet with NFC

- 📊 **Analytics Dashboard** - Transaction history and charts- ✅ ProGuard minification

- 🔄 **Token Swaps** - Built-in DEX integration

- 💰 **DeFi Integration** - Staking and yield farming- ✅ Resource shrinking````env

- 🌍 **Multi-language Support**

- ✅ Console.log removal

## Contributing

- ✅ APK splits by architecture (ARM, x86)# CoinGecko API (get free key from https://www.coingecko.com/en/api)### Environment Setup```sh

We welcome contributions! Please:



1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)**Output locations:**COIN_GECKO_API_KEY=your_api_key_here

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)- APK: `android/app/build/outputs/apk/release/`

5. Open a Pull Request

- AAB: `android/app/build/outputs/bundle/release/`bundle install

## License



This project is licensed under the MIT License.

---# Security salts (generate random strings)

## Links



- **Website**: [https://auron-vault.com/](https://auron-vault.com/)

- **Documentation**: Coming soon## 📁 Project StructureDEVELOPMENT_SALT=your_development_saltComplete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android development.```

- **Support**: Visit our website for support



## Disclaimer

```PRODUCTION_SALT=your_production_salt

Auron Vault is experimental software. Use at your own risk. Always backup your recovery phrases and NFC cards. The developers are not responsible for lost funds.

auron/

---

├── src/

<p align="center">

  Built with ❤️ using React Native│   ├── components/      # Reusable UI components

</p>

│   ├── screens/         # App screens (Dashboard, AssetDetail, etc.)# Blockchain RPC URLs (use your Chainstack endpoints)

│   ├── navigation/      # React Navigation setup

│   ├── hooks/           # Custom React hooks (wallet creation)ETHEREUM_RPC_URL=https://your-ethereum-rpc.com## 📦 InstallationThen, and every time you update your native dependencies, run:

│   ├── services/        # API services (CoinGecko, balances, transfers)

│   ├── context/         # React Context (WalletContext)BSC_RPC_URL=https://your-bsc-rpc.com

│   ├── utils/           # Utilities (caching, performance, transactions)

│   ├── constants/       # Constants (colors, fonts, assets)SOLANA_RPC_URL=https://your-solana-rpc.com

│   └── assets/          # Images, fonts, animations

├── android/             # Android native codeBITCOIN_RPC_URL=https://your-bitcoin-rpc.com

├── ios/                 # iOS native code (coming soon)

└── .env                 # Environment variables (not in git)```1. **Clone the repository**```sh

```````

---

---```bashbundle exec pod install

## 🔐 Security Features

- **Non-Custodial**: Private keys never leave your device

- **NFC Integration**: Deterministic wallet generation using NFC cards## 🏃 Running the Appgit clone https://github.com/yourusername/auron.git```

- **BIP39 Compatible**: Standard mnemonic phrase support

- **Secure Storage**: Environment-based salt encryption

- **No Telemetry**: Your transaction data stays private

### Development Modecd auron

> ⚠️ **Important**: Always backup your NFC card and recovery phrase. Loss of both means permanent loss of funds.

---

**1. Start Metro bundler**```For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

## 🔧 Supported Blockchain Networks

| Network | Symbol | Features |

|---------|--------|----------|```bash

| Bitcoin | BTC | Native SegWit (Bech32) addresses |

| Ethereum | ETH | ERC-20 token support |npm start

| Binance Smart Chain | BSC | BEP-20 token support |

| Solana | SOL | SPL token support |`2. **Install dependencies**`sh

---

## 📊 Development**2. Run on Android (in a new terminal)**```bash# Using npm

### Code Quality

Run linter:```bashnpm installnpm run ios

```bashnpm run android

npm run lint

```

Fix auto-fixable issues:Or build and run from Android Studio:# OR using Yarn

```bash- Open `android/` folder in Android Studio

npm run lint -- --fix

```- Click **Run** or press `Shift + F10`3. **Configure environment variables**yarn ios

### Testing### Production Build````

```bash**Build an optimized APK:**Create a `.env` file in the root directory:

npm test

````bash`bashIf everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

---npm run android:release

## 🐛 Troubleshooting`````cp .env.example .env

### Android Build Issues

**Gradle build fails:\*\***Build Android App Bundle (for Play Store):\*\*```This is one way to run your app — you can also build it directly from Android Studio or Xcode.

````bash

cd android

./gradlew clean```bash

cd ..

npm run androidnpm run android:bundle

````

```Edit `.env` and add your configuration:## Step 3: Modify your app

**Metro bundler cache issues:**

````bash

npm start -- --reset-cacheThe production build includes:```env

````

- ✅ ProGuard minification

**NFC not working:**

- Ensure device supports NFC- ✅ Resource shrinking# CoinGecko API (get free key from https://www.coingecko.com/en/api)Now that you have successfully run the app, let's make changes!

- Enable NFC in Android settings

- Grant NFC permissions to the app- ✅ Console.log removal

### Environment Variable Issues- ✅ APK splits by architecture (ARM, x86)COIN_GECKO_API_KEY=your_api_key_here

If you see "undefined" for RPC URLs or API keys:

1. Ensure `.env` file exists in root directory

2. Restart Metro bundler after editing `.env`**Output locations:**Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

3. Rebuild the app (not just reload)

- APK: `android/app/build/outputs/apk/release/`

---

- AAB: `android/app/build/outputs/bundle/release/`# Security salts (generate random strings)

## 🚀 Coming Soon

- 📱 **iOS Support** - Full iOS wallet with NFC

- 📊 **Analytics Dashboard** - Transaction history and charts---DEVELOPMENT_SALT=your_development_saltWhen you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- 🔄 **Token Swaps** - Built-in DEX integration

- 💰 **DeFi Integration** - Staking and yield farming

- 🌍 **Multi-language Support**

## 📁 Project StructurePRODUCTION_SALT=your_production_salt

---

## 🤝 Contributing

`````- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).

We welcome contributions! Please:

auron/

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)├── src/# Blockchain RPC URLs (use your Chainstack endpoints)- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to the branch (`git push origin feature/amazing-feature`)│   ├── components/      # Reusable UI components

5. Open a Pull Request

│   ├── screens/         # App screens (Dashboard, AssetDetail, etc.)ETHEREUM_RPC_URL=https://your-ethereum-rpc.com

---

│   ├── navigation/      # React Navigation setup

## 📄 License

│   ├── hooks/           # Custom React hooks (wallet creation)BSC_RPC_URL=https://your-bsc-rpc.com## Congratulations! :tada:

This project is licensed under the MIT License.

│   ├── services/        # API services (CoinGecko, balances, transfers)

---

│   ├── context/         # React Context (WalletContext)SOLANA_RPC_URL=https://your-solana-rpc.com

## 🔗 Links

│   ├── utils/           # Utilities (caching, performance, transactions)

- **Website**: [https://auron-vault.com/](https://auron-vault.com/)

- **Documentation**: Coming soon│   ├── constants/       # Constants (colors, fonts, assets)BITCOIN_RPC_URL=https://your-bitcoin-rpc.comYou've successfully run and modified your React Native App. :partying_face:

- **Support**: Visit our website for support

│   └── assets/          # Images, fonts, animations

---

├── android/             # Android native code````

## ⚠️ Disclaimer

├── ios/                 # iOS native code (coming soon)

Auron Vault is experimental software. Use at your own risk. Always backup your recovery phrases and NFC cards. The developers are not responsible for lost funds.

└── .env                 # Environment variables (not in git)### Now what?

---

`````

<p align="center">

Built with ❤️ using React Native## 🏃 Running the App

</p>

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
