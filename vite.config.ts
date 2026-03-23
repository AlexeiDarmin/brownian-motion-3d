import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/brownian-motion-3d/',
  plugins: [react()],
})
