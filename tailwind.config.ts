import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: ({ theme }: { theme: any }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray[700]'),
            '--tw-prose-headings': theme('colors.gray[800]'),
            '--tw-prose-links': theme('colors.green[600]'),
            '--tw-prose-bold': theme('colors.gray[800]'),
            img: {
              borderRadius: theme('borderRadius.xl'),
              boxShadow: theme('boxShadow.lg'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
