
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Declare process for compatibility
declare const process: any;

export default defineConfig(({ mode }) => {
  // Load all environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Prioritize VITE_ prefixed keys for standard Vite behavior
  const apiKey = env.VITE_GEMINI_API_KEY || env.VITE_API_KEY || env.GEMINI_API_KEY || env.API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // This ensures 'process.env.API_KEY' is replaced with the actual string during build
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
