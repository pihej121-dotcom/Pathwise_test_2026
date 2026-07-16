import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pathwise.app',
  appName: 'Pathwise',
  webDir: 'dist/public',
  server: {
    // For development: set APP_URL to your local or dev server URL.
    // For production builds, leave APP_URL unset so the app uses its bundled assets.
    url: process.env.APP_URL,
    cleartext: true,
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small"
    }
  }
};

export default config;
