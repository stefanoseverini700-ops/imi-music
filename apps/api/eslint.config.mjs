import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    rules: {
      // NestJS usa decoratori e classi con dipendenze iniettate.
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
];
