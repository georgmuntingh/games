const DURATION = 10;

const playBtn = document.getElementById('play');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');

let score = 0;
let timeLeft = DURATION;
let active = false;
let timer = null;

function start() {
  score = 0;
  timeLeft = DURATION;
  active = true;
  scoreEl.textContent = '0';
  timeEl.textContent = String(DURATION);
  playBtn.textContent = 'Click!';
  timer = setInterval(tick, 1000);
}

function tick() {
  timeLeft -= 1;
  timeEl.textContent = String(timeLeft);
  if (timeLeft <= 0) end();
}

function end() {
  clearInterval(timer);
  active = false;
  playBtn.textContent = `Done — final score ${score}. Play again?`;
}

playBtn.addEventListener('click', () => {
  if (!active) {
    start();
    return;
  }
  score += 1;
  scoreEl.textContent = String(score);
});
