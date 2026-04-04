import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
