import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beyondthereef.reportthereef',
  appName: 'Report The Reef',
  webDir: 'www',
  server: {
    url: 'https://reportthereef.com',
    cleartext: false,
  },
};

export default config;
