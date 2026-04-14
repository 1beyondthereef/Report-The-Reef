import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beyondthereef.reportthereef',
  appName: 'Report The Reef',
  server: {
    url: 'https://www.reportthereef.com',
    cleartext: false,
    allowNavigation: [
      'reportthereef.com',
      '*.reportthereef.com',
      '*.supabase.co',
      'accounts.google.com'
    ]
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    preferredContentMode: 'mobile',
    backgroundColor: '#0a1628'
  }
};

export default config;
