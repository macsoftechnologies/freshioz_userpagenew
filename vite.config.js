import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            return 'vendor';
          }
          if (id.includes('/src/pages/') || id.includes('\\src\\pages\\')) {
            if (id.includes('Catalog') || id.includes('ProductDetails') || id.includes('Wholesale')) {
              return 'page-catalog';
            }
            if (id.includes('SocietyPartnerPortal') || id.includes('UserProfile')) {
              return 'page-account';
            }
            if (id.includes('Checkout') || id.includes('OrderTracking')) {
              return 'page-orders';
            }
          }
        }
      }
    }
  }
})
