import { defineConfig } from 'vite';
// TODO: import { htmsPlugin } from '@progalaxyelabs/htms-compiler/vite';

export default defineConfig({
  // TODO: plugins: [htmsPlugin()],
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
});
