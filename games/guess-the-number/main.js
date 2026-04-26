const form = document.getElementById('guess-form');
const input = document.getElementById('guess');
const feedback = document.getElementById('feedback');
const countEl = document.getElementById('count');
const resetBtn = document.getElementById('reset');

let secret;
let count;

function reset() {
  secret = Math.floor(Math.random() * 100) + 1;
  count = 0;
  countEl.textContent = '0';
  feedback.textContent = '';
  feedback.className = 'feedback';
  input.value = '';
  input.disabled = false;
  resetBtn.hidden = true;
  input.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const guess = Number(input.value);
  if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
    feedback.textContent = 'Please enter a whole number from 1 to 100.';
    feedback.className = 'feedback warn';
    return;
  }
  count += 1;
  countEl.textContent = String(count);

  if (guess === secret) {
    feedback.textContent = `Got it! ${secret} in ${count} guess${count === 1 ? '' : 'es'}.`;
    feedback.className = 'feedback win';
    input.disabled = true;
    resetBtn.hidden = false;
    resetBtn.focus();
  } else if (guess < secret) {
    feedback.textContent = 'Higher.';
    feedback.className = 'feedback hint';
  } else {
    feedback.textContent = 'Lower.';
    feedback.className = 'feedback hint';
  }
  input.value = '';
  input.focus();
});

resetBtn.addEventListener('click', reset);

reset();
