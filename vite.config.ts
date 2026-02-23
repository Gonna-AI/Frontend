import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';
import netlifyPlugin from '@netlify/vite-plugin';
import path from "path"
import { blogPosts } from './src/data/blogPosts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    netlifyPlugin(),
    viteCompression(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml'],
      workbox: {
        // Remove outdated precached assets when deploying new builds
        cleanupOutdatedCaches: true,
        // Activate new SW immediately (don't wait for all tabs to close)
        skipWaiting: true,
        clientsClaim: true,
        // Don't precache source maps
        globIgnores: ['**/node_modules/**', '**/*.map'],
        // Navigation routes should always go to network first to get fresh index.html
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^\/(?!\api)/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
        ],
      },
      manifest: {
        name: 'ClerkTree',
        short_name: 'ClerkTree',
        description: 'AI-powered workflow automation for claims and back-office operations',
        theme_color: '#0a0a0a',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
    Sitemap({
      hostname: 'https://clerktree.com',
      dynamicRoutes: [
        '/about',
        '/solutions',
        '/blog',
        '/contact',
        '/terms-of-service',
        '/privacy-policy',
        '/cookie-policy',
        '/security',
        ...blogPosts.map((post) => `/blog/${post.slug}`),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // Expose on local network
    port: 5173,
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 200, // Warn if any chunk exceeds 200KB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          'framer-motion': ['framer-motion'],
          icons: ['lucide-react'],
          supabase: ['@supabase/supabase-js'],
          sentry: ['@sentry/react'],
        },
      },
    },
  },
  esbuild: {
    // Strip console.log and debugger from production builds
    // Keeps console.warn and console.error for monitoring
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
