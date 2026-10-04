import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Serve fixtures without CRXJS, so tests never write to the extension's dist directory.
export default defineConfig({ plugins: [react()] })
