
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Declare process to satisfy TypeScript
declare const process: any;

export default defineConfig(({ mode }) => {
  // loadEnv loads variables from .env files and environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Try to find the API key in common naming conventions
  const apiKey = env.VITE_GEMINI_API_KEY || env.VITE_API_KEY || env.GEMINI_API_KEY || env.API_KEY;

  return {
    plugins: [react()],
    define: {
      // Inject the API key into the application environment
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 5173,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});
