import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert { type: 'json' }
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    vue(),
    crx({ manifest }),
    checker({
      typescript: true,
      vueTsc: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{vue,ts,js}"',
      },
    }),
  ],
})
