import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: ['.next/**', 'dist/**', 'node_modules/**', 'out/**'] },
  // Flat config only lints .js/.mjs/.cjs by default; the components are .jsx.
  { files: ['**/*.{js,jsx,mjs}'] },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // Documented exception: the landing page art is already pre-optimised static WebP, referenced by class-driven CSS
      // (GSAP, the mascot and the card tilt select these nodes) and ships explicit width/height with lazy loading.
      // The LCP hero image and the header logo use next/image; re-encoding ~160 decorative <img> tags through the
      // image optimiser would not change what is delivered and would risk the pixel-matched layout.
      '@next/next/no-img-element': 'off',
    },
  },
];

export default config;
