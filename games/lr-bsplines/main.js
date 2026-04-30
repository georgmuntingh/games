// Phase 0 scaffold. State management, rendering, and interactivity
// are implemented in subsequent phases (see plan).

const board = document.getElementById('board');
const status = document.getElementById('status');

// Placeholder so the layout is visibly correct before the renderer lands.
board.innerHTML = `
  <rect class="domain-bg" x="40" y="40" width="520" height="520" />
  <text
    x="300" y="300"
    text-anchor="middle" dominant-baseline="middle"
    fill="currentColor" font-size="14" opacity="0.35"
  >Scaffolding only — interactive behaviour pending.</text>
`;

if (status) status.textContent = 'Scaffolding loaded.';
