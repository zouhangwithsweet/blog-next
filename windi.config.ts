import colors from 'windicss/colors'
import typography from 'windicss/plugin/typography'

export default {
  extract: {
    include: ['./.vitepress/theme/**/*.vue', './posts/**/*.md'],
  },
  safelist: ['prose', 'prose-sm', 'm-auto'],
  darkMode: 'class',
  plugins: [typography],
  theme: {
    extend: {
      colors: {
        teal: colors.teal,
      },
    }
  },
}