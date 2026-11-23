import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { host: true },
  plugins: [
    react(),
    tailwindcss(),
    cloudflare(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'VendorTracker',
        short_name: 'VendorTracker',
        description: 'Suivi quotidien des livraisons, invendus et recette caisse vendeur.',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}', '**/inter-latin-*.woff2'],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
})
