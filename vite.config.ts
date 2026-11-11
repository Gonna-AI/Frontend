import path from 'node:path';

import netlifyPlugin from '@netlify/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    netlifyPlugin(),
    // The site no longer runs a service worker: hashed assets are cached by the
    // CDN and the browser, and a worker only added stale-content risk. This
    // ships a self-destroying worker so browsers that installed the old one
    // unregister it and drop its caches. Remove the plugin a few months after
    // this release, once returning visitors have picked it up.
    VitePWA({ selfDestroying: true, manifest: false }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'framer-motion'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'lucide-react-dash'],
  },
  server: {
    host: '0.0.0.0', // reachable from other devices on the local network
    port: 5173,
  },
  build: {
    // Preload each route's own chunks in parallel instead of discovering them
    // one import at a time; the polyfill is only needed by browsers we do not target.
    modulePreload: { polyfill: false },
    cssCodeSplit: true,
    // Read by scripts/prerender-routes.mjs to preload each page's own chunks (and removed afterwards).
    manifest: true,
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      onwarn(warning, warn) {
        // "use no memo" is a React Compiler hint in the dashboard tables; bundling ignores it by design.
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
      output: {
        // Opaque file names: the public bundle should not spell out the app's internal structure
        // (page and feature names). Library chunks keep a neutral name for the size budget.
        chunkFileNames: (chunk) => (chunk.name.endsWith('-vendor') ? 'assets/[name]-[hash].js' : 'assets/[hash].js'),
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash][extname]',
        manualChunks(id) {
          // The analytics SDK and its guard load together, only after consent.
          if (id.includes('/@amplitude/') || id.includes('/rrweb') || id.includes('/src/lib/amplitudeSdk') || id.includes('/src/lib/analyticsGuard')) return 'analytics-vendor';
          if (!id.includes('/node_modules/')) return undefined;

          // Exact package folders only: a loose '/react/' match also swept in @fullcalendar/react (the
          // dashboard calendar, ~100 KB) and made every page download it.
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/scheduler/')) return 'react-vendor';
          if (id.includes('/react-router') || id.includes('/react-helmet-async/')) return 'router-vendor';
          if (id.includes('/@tanstack/react-query/')) return 'query-vendor';
          if (id.includes('/@tanstack/react-table/')) return 'table-vendor';
          if (id.includes('/@supabase/')) return 'supabase';
          if (id.includes('/framer-motion/') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) return 'animation-vendor';
          if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory-vendor/')) return 'chart-vendor';
          if (id.includes('/lucide-react') || id.includes('/simple-icons/')) return 'icon-vendor';
          if (id.includes('/radix-ui/') || id.includes('/@radix-ui/') || id.includes('/vaul/') || id.includes('/cmdk/')) return 'ui-vendor';
          if (id.includes('/react-markdown/') || id.includes('/remark-') || id.includes('/micromark') || id.includes('/mdast-') || id.includes('/hast-') || id.includes('/unified/')) return 'markdown-vendor';
          if (id.includes('/@dnd-kit/')) return 'dnd-vendor';
          if (id.includes('/react-hook-form/') || id.includes('/@hookform/') || id.includes('/zod/')) return 'form-vendor';

          return undefined;
        },
      },
    },
  },
  esbuild: {
    // Production builds print nothing to the visitor's console and carry no comments.
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    legalComments: 'none',
  },
});
