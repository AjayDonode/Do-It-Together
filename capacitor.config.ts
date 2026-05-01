import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doittogether.app',
  appName: 'Do It Together',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  }
};

export default config;
