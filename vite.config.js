import { defineConfig } from 'vite'

export default defineConfig({
  // Base URL - pro GitHub Pages použij '/nk-opava/', pro vlastní doménu '/'
  base: '/',

  // Build options for production
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',

    // Optimize chunks for better loading performance
    rollupOptions: {
      output: {
        // Split large modules into separate chunks
        manualChunks: {
          'player-data': ['./src/playerData.js'],
          'extraliga-teams': ['./src/extraligaTeams.js'],
          'league-teams': ['./src/leagueTeams.js']
        },
        // Organized asset file structure
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]

          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|avif|webp)$/i.test(assetInfo.name)) {
            extType = 'images'
          } else if (/\.(mp4|webm|ogg|mp3|wav|flac|aac|mov)$/i.test(assetInfo.name)) {
            extType = 'media'
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts'
          }

          return `${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    },

    // Increase chunk size warning limit (videos make files large)
    chunkSizeWarningLimit: 2000,

    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  },

  // Development server options
  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: true,
    // SPA fallback - všechny neexistující cesty přesměrovat na index.html
    historyApiFallback: true
  },

  // Preview server options
  preview: {
    port: 4173,
    open: true,
    // SPA fallback pro preview mode
    historyApiFallback: true
  },

  // Public directory
  publicDir: 'public',

  // CSS options
  css: {
    devSourcemap: false
  }
})
