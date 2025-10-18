import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Export config
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Chrome will load files from here
  }
})

