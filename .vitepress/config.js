import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'zouhang\'s blog',
  description: 'The offical blog for the Vue.js project',
  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
  ],
  vite: {
    build: {
      minify: 'terser'
    }
  }
})
