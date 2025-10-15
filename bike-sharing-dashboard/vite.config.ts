import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
   
    minify: 'terser',
   
    rollupOptions: {
      output: {
       
        manualChunks: {
      
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        
          'vendor-ui': ['@mui/material', '@radix-ui/react-slot', '@radix-ui/react-tabs'],
         
          'vendor-charts': ['recharts', 'd3-scale', 'd3-shape', 'd3-interpolate'],
          
          'vendor-utils': ['class-variance-authority', 'clsx', 'tailwind-merge']
        },
       
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },

    chunkSizeWarningLimit: 1000,
   
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, '/src'),
    },
  },

  server: {

    hmr: {
      overlay: false
    }
  }
})