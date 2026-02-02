import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Injects the variable into the client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || env.VITE_GEMINI_API_KEY || '')
    }
  };
});