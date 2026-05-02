import { defineConfig } from 'vite';
import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const gamesDir = resolve(__dirname, 'games');

const gameInputs = Object.fromEntries(
  readdirSync(gamesDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(resolve(gamesDir, entry.name, 'index.html'))
    )
    .flatMap((entry) => {
      const gameDir = resolve(gamesDir, entry.name);
      const entries = [[`games/${entry.name}`, resolve(gameDir, 'index.html')]];
      const testsHtml = resolve(gameDir, 'tests', 'index.html');
      if (existsSync(testsHtml)) {
        entries.push([`games/${entry.name}/tests`, testsHtml]);
      }
      return entries;
    })
);

export default defineConfig(({ command }) => ({
  base:
    process.env.VITE_BASE_PATH ||
    (command === 'serve' ? '/' : '/games/'),
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...gameInputs,
      },
    },
  },
}));
