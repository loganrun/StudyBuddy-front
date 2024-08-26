import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['stream', 'buffer', 'crypto', 'events', 'process', 'util'],
    }),
  ],
  resolve: {
    alias: {
      'simple-peer': 'simple-peer/simplepeer.min.js',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   define: {
//     'process.env': {},
//   },
//   build: {
//     commonjsOptions: {
//       transformMixedEsModules: true,
//     },
//   },
// });