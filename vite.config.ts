import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    envDir: './environments', // Load env files from environments/ directory
    define: {
      'process.env.SECRET_KEY': JSON.stringify(env.VITE_SECRET_KEY || env.SECRET_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 4200,
      host: true,
    },
  };
});
