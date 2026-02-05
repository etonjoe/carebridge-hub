
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Optimized for root domain deployment
export default defineConfig({
  base: '/', 
  plugins: [react()],
  define: {
    // This ensures process.env.API_KEY is available in the bundled code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
