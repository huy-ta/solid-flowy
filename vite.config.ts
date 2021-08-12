import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'SolidFlowy',
      fileName: (format) => `solid-flowy.${format}.js`,
    },
  },
});
