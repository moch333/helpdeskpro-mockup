import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cambia 'helpdeskpro-mockup' por el nombre exacto de tu repositorio de GitHub.
// Si tu repo se llama distinto, este valor debe coincidir o la página en
// GitHub Pages cargará en blanco (rutas de assets rotas).
export default defineConfig({
  plugins: [react()],
  base: '/helpdeskpro-mockup/',
})
