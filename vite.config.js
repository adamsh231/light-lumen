import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyDownloadsPlugin() {
  return {
    name: 'copy-downloads',
    closeBundle() {
      const srcDir = path.resolve(__dirname, 'downloads');
      const destDir = path.resolve(__dirname, 'dist', 'downloads');
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, destDir, { recursive: true });
        console.log('✓ Successfully copied downloads/ to dist/downloads/');
      }
    }
  };
}

export default defineConfig({
  root: './',
  base: './',
  plugins: [copyDownloadsPlugin()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true
  }
});
