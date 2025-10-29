// tailwind.config.js

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}', // <-- Tambahkan path src
  ],
  theme: {
    extend: {
      fontFamily: {
        'pnb-regular': 'PostNoBillsColombo-Regular', // Ubah ini juga
        'pnb-bold': 'PostNoBillsColombo-Bold',
        'pnb-semibold': 'PostNoBillsColombo-SemiBold', // Ubah ini juga
      },
      boxShadow: {
        custom: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
