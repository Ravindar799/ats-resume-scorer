import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    // 👇 Add your Render domain here
    allowedHosts: ["ats-resume-scorer-2.onrender.com"],
    host: true,
    port: 4173
  }
})
