
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Declare process to satisfy TypeScript in environments where @types/node is not present
declare const process: any;

export default defineConfig(({ mode }) => {
  // loadEnv loads variables from .env files and environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Inject the API key into the application environment
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.API_KEY)
    },
    server: {
      port: 5173,
      open: true
    }
  };
});
