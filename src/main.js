import manifest from '../games/manifest.json';

const base = import.meta.env.BASE_URL;
const list = document.getElementById('game-list');
const search = document.getElementById('search');
const empty = document.getElementById('empty');

function escape(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c]
  );
}

function matchesQuery(game, query) {
  if (!query) return true;
  const haystack = [game.title, game.description, ...(game.tags || [])]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function render(rawQuery = '') {
  const query = rawQuery.trim().toLowerCase();
  const matches = manifest.games.filter((g) => matchesQuery(g, query));

  list.innerHTML = matches
    .map(
      (g) => `
        <li class="game-card">
          <a href="${base}games/${encodeURIComponent(g.id)}/">
            <h2>${escape(g.title)}</h2>
            <p>${escape(g.description)}</p>
            <div class="tags">
              ${(g.tags || [])
                .map((t) => `<span class="tag">${escape(t)}</span>`)
                .join('')}
            </div>
          </a>
        </li>
      `
    )
    .join('');

  empty.hidden = matches.length > 0;
}

search.addEventListener('input', (event) => render(event.target.value));
render();
