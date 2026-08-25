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
      // Every page under tests/, not just index.html — a game may have more than one kind
      // of check to run, and a page that is not a build input is a page that works in dev
      // and 404s in production.
      const testsDir = resolve(gameDir, 'tests');
      if (existsSync(testsDir)) {
        for (const file of readdirSync(testsDir)) {
          if (!file.endsWith('.html')) continue;
          const name = file === 'index.html' ? 'tests' : `tests/${file.replace(/\.html$/, '')}`;
          entries.push([`games/${entry.name}/${name}`, resolve(testsDir, file)]);
        }
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
