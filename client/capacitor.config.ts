import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.polinela.absensi',
  appName: 'Absensi Polinela',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;