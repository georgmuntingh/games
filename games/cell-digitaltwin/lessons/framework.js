// Generic lesson controller. Owns the current lesson/step index and renders into
// the provided DOM nodes. `apply(step)` is supplied by the host (main.js) and is
// responsible for actually mutating the simulation/visualisation for a step.

export function createLessonController({ lessons, dom, apply }) {
  let lessonIdx = -1;
  let stepIdx = 0;

  function renderList() {
    dom.list.innerHTML = '';
    lessons.forEach((lesson, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `<span class="num">${i + 1}</span><span>${lesson.title.replace(/^\d+\s·\s/, '')}</span>`;
      btn.addEventListener('click', () => start(i));
      li.appendChild(btn);
      dom.list.appendChild(li);
    });
  }

  function start(i) {
    lessonIdx = i;
    stepIdx = 0;
    dom.active.hidden = false;
    showStep();
  }

  function exit() {
    lessonIdx = -1;
    dom.active.hidden = true;
    apply(null);
  }

  function showStep() {
    const lesson = lessons[lessonIdx];
    const step = lesson.steps[stepIdx];
    dom.title.textContent = `${lesson.title} — ${step.title}`;
    let body = `<div>${step.html}</div>`;
    if (step.eq) body += `<div class="eq">${escapeHtml(step.eq)}</div>`;
    if (step.observe) body += `<div class="observe">👁 ${step.observe}</div>`;
    dom.body.innerHTML = body;
    dom.progress.textContent = `step ${stepIdx + 1} / ${lesson.steps.length}`;
    dom.prev.disabled = stepIdx === 0 && lessonIdx === 0;
    dom.next.disabled = false;
    apply(step);
  }

  function next() {
    const lesson = lessons[lessonIdx];
    if (stepIdx < lesson.steps.length - 1) {
      stepIdx++;
    } else if (lessonIdx < lessons.length - 1) {
      lessonIdx++; stepIdx = 0;
    } else {
      return; // end
    }
    showStep();
  }

  function prev() {
    if (stepIdx > 0) {
      stepIdx--;
    } else if (lessonIdx > 0) {
      lessonIdx--; stepIdx = lessons[lessonIdx].steps.length - 1;
    } else {
      return;
    }
    showStep();
  }

  dom.next.addEventListener('click', next);
  dom.prev.addEventListener('click', prev);
  dom.exit.addEventListener('click', exit);
  renderList();

  return { start, exit, isActive: () => lessonIdx >= 0 };
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
