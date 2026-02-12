import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';
import path from "path"
import { blogPosts } from './src/data/blogPosts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml'],
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
});
