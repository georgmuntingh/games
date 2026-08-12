// Launcher shortcuts. `keys` are what you type; the first key is the canonical
// one. Put %s in `url` to accept an argument after the key — typing `w otters`
// substitutes `otters`, typing `w` alone opens the site's origin instead.
// Edit this file to change what the launcher knows about; it is the only
// configuration surface, and it travels with the page to every device.
export const LINKS = [
  {
    keys: ['games', 'g'],
    label: 'Games',
    url: 'https://georgmuntingh.github.io/games/',
  },
  { keys: ['gh'], label: 'GitHub', url: 'https://github.com' },
  { keys: ['mail', 'm'], label: 'Gmail', url: 'https://mail.google.com' },
  { keys: ['cal', 'c'], label: 'Calendar', url: 'https://calendar.google.com' },
  {
    keys: ['w'],
    label: 'Wikipedia',
    url: 'https://en.wikipedia.org/w/index.php?search=%s',
  },
];

// Anything the launcher cannot resolve to a link or a URL goes here.
export const SEARCH = 'https://duckduckgo.com/?q=%s';
