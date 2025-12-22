import { defineConfig } from 'vite';
import { htmsPlugin } from '@progalaxyelabs/htms-cli/vite';

export default defineConfig({
  plugins: [
    htmsPlugin({
      include: /\.htms$/,
      outputDir: 'src/generated'
    })
  ],
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
});
