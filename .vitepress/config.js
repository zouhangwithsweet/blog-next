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
      },
      'link',
      {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'https://cdn.bootcdn.net/ajax/libs/firacode/6.2.0/fira_code.min.css',
      },
    ],
  ],
  vite: {
    build: {
      minify: 'terser'
    }
  }
})
