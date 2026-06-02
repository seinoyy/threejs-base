import { defineConfig } from 'vite'
import { resolve } from 'path'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [
    glsl()
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, '.', 'src')
      }
    ]
  }
})