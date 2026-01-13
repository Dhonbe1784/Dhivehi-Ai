
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Declare process for compatibility during build time
declare const process: any;

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // We look for VITE_API_KEY as the primary source, then fallbacks
  const apiKey = env.VITE_API_KEY || env.API_KEY || env.VITE_GEMINI_API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // This strictly follows the instruction to provide process.env.API_KEY
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
