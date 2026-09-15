import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// A Hostinger (domínio próprio) serve o site na raiz; o GitHub Pages de
// projeto usa um subcaminho. O build do GitHub Actions já define
// GITHUB_ACTIONS=true sozinho, então um "npm run build" normal (o que você
// roda pra Hostinger) sempre cai na raiz "/".
const REPO_NAME = 'jr-veiculos-app'
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  base: isGitHubPagesBuild ? `/${REPO_NAME}/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
