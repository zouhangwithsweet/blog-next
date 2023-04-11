import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://zouhaha-blog-next.netlify.app/',
	markdown: {
    render: [
      '@astrojs/markdown-remark',
      {
        syntaxHighlight: 'shiki',
        shikiConfig: {
          theme: 'nord',
          langs: ['js', 'html', 'css', 'astro'],
          wrap: false,
        },
      },
    ],
  },
	integrations: [mdx(), sitemap(), vue()],
});
