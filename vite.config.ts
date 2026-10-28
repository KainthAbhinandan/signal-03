import { defineConfig } from 'vite';
import packageInfo from './package.json' with { type: 'json' };

export default defineConfig({
  base: './',
  define: { __GAME_VERSION__: JSON.stringify(packageInfo.version) },
  server: { port: 5173, strictPort: true },
  build: { target: 'es2022', outDir: 'dist' },
});
