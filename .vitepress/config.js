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
        href: '/logo.png'
      }
    ]
  ],
  vite: {
    build: {
      minify: 'terser'
    }
  }
})
