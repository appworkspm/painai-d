import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Public directory configuration
    publicDir: 'public',

    plugins: [
      // Basic React plugin with Babel for optimization
      react({
        babel: {
          plugins: [],
          // Enable Fast Refresh
          babelrc: false,
          configFile: false,
        },
      }),
      
      // PWA configuration (can be disabled if not needed)
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'painai-timesheet',
          short_name: 'painai-timesheet',
          description: 'Painai Timesheet Management System',
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
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
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
      port: parseInt(env.VITE_PORT || '5173', 10),
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    // Preview server configuration
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173', 10),
      host: true,
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      cssMinify: mode === 'production',
      target: 'esnext',
      // Ensure JSON files are properly included in the build
      assetsInlineLimit: 0, // Disable inlining of assets to ensure JSON files are copied
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor and app code
            vendor: ['react', 'react-dom', 'react-router-dom', 'react-query', 'i18next', 'react-i18next'],
          },
          // Ensure proper handling of JSON files
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.json')) {
              return 'locales/[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
        // Ensure JSON files are properly processed
        preserveEntrySignatures: 'strict',
      },
      // Copy public files to dist
      copyPublicDir: true,
    },
    
    // CSS configuration
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  };
});
