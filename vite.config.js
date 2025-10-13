import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Pro lokální vývoj; pro GitHub Pages změňte na '/muj-web/'
  build: {
    outDir: 'dist'
  }
})
