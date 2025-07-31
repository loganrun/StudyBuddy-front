import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
//import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['stream', 'buffer', 'crypto', 'events', 'process', 'util'],
    }),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
    //       dest: ''
    //     }
    //   ]
    // })
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
    rollupOptions: {
      external: ['stream-browserify'],
    },
  },
});
