import { ExpoConfig } from '@expo/config-types';

export default (): ExpoConfig => ({
  name: 'Nunito',
  slug: 'Nunito',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',

  extra: {
    eas: {
      projectId: 'a97814f3-0af6-4472-9df5-beb6f8b4aac3',
    },
  },

  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.andresalvarez.nunito',
    adaptiveIcon: {
      foregroundImage: './assets/favicon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
});
