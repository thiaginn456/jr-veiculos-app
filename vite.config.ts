import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// Nome do repositório no GitHub — o Pages de projeto serve o site em
// https://<usuario>.github.io/<repo>/, então todos os caminhos (JS, CSS,
// imagens, rotas) precisam desse prefixo.
const REPO_NAME = 'jr-veiculos-app'

export default defineConfig({
  base: `/${REPO_NAME}/`,
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
