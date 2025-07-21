import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      // Basic React plugin
      react(),
      
      // PWA configuration (can be disabled if not needed)
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: env.VITE_APP_NAME || 'Painai',
          short_name: 'Painai',
          description: env.VITE_APP_DESCRIPTION || 'Painai Timesheet Management System',
          theme_color: env.VITE_THEME_COLOR || '#2563eb',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        },
      }),
      
      // Bundle analyzer (only in analyze mode)
      mode === 'analyze' && visualizer({
        open: true,
        filename: './dist/stats.html',
      }),
    ].filter(Boolean),
    
    // Environment variables available in the client
    define: {
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || 'Painai'),
      __APP_DESCRIPTION__: JSON.stringify(env.VITE_APP_DESCRIPTION || 'Painai Timesheet Management System'),
      __THEME_COLOR__: JSON.stringify(env.VITE_THEME_COLOR || '#2563eb'),
    },
    
    // Development server configuration
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      origin: 'http://localhost:3000',
    },
    
    // Preview server configuration
    preview: {
      port: 3000,
      strictPort: true,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      cssMinify: mode === 'production',
      target: 'esnext',
    },
    
    // CSS configuration
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    
    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
