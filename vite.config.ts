import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' keeps every asset path relative, so the build works on
// GitHub Pages sub-paths, Vercel, Netlify or straight from a USB stick.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) expects a function here
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap') || id.includes('node_modules/lenis')) return 'motion'
          return undefined
        },
      },
    },
  },
})
