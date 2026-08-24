// Next.js usa il proprio preset (eslint-config-next) via `next lint`.
// Config flat minimale per il resto degli strumenti.
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['.next/**'],
  },
];
