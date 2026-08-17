/**
 * The task detail panel.
 *
 * Binds the static markup in index.html to one task and reports edits back as partial
 * patches. Text fields commit on `change` (blur or Enter) rather than on every
 * keystroke, so one edit is one undo step.
 */

const $ = (id) => document.getElementById(id);

const splitList = (value) =>
  String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export function createPanel(handlers = {}) {
  const root = $('panel');
  const els = {
    title: $('t-title'),
    done: $('t-done'),
    due: $('t-due'),
    estimate: $('t-estimate'),
    projects: $('t-projects'),
    people: $('t-people'),
    blocked: $('t-blocked'),
    partof: $('t-partof'),
    subtasks: $('t-subtasks'),
    subtaskForm: $('subtask-form'),
    subtaskNew: $('subtask-new'),
    notes: $('t-notes'),
    del: $('t-delete'),
    close: $('panel-close'),
    suggestSubtasks: $('suggest-subtasks'),
    suggestEstimate: $('suggest-estimate'),
    peopleList: $('people-list'),
    projectList: $('project-list'),
  };

  let current = null;

  const patch = (changes) => {
    if (current) handlers.onChange?.(current.id, changes);
  };

  els.title.addEventListener('change', () => patch({ title: els.title.value.trim() }));
  els.done.addEventListener('change', () => patch({ done: els.done.checked }));
  els.due.addEventListener('change', () => patch({ due: els.due.value }));
  els.estimate.addEventListener('change', () => patch({ estimate: els.estimate.value.trim() }));
  els.projects.addEventListener('change', () => patch({ project: splitList(els.projects.value) }));
  els.people.addEventListener('change', () => patch({ people: splitList(els.people.value) }));
  els.notes.addEventListener('change', () => patch({ notes: els.notes.value }));

  const selectedValues = (select) => [...select.selectedOptions].map((o) => o.value);
  els.blocked.addEventListener('change', () => patch({ blockedBy: selectedValues(els.blocked) }));
  els.partof.addEventListener('change', () => patch({ partOf: selectedValues(els.partof) }));

  els.close.addEventListener('click', () => handlers.onSelect?.(null));
  els.del.addEventListener('click', () => current && handlers.onDelete?.(current.id));
  els.suggestSubtasks.addEventListener('click', () => current && handlers.onSuggest?.('subtasks', current.id));
  els.suggestEstimate.addEventListener('click', () => current && handlers.onSuggest?.('estimate', current.id));

  els.subtaskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = els.subtaskNew.value.trim();
    if (!text || !current) return;
    els.subtaskNew.value = '';
    patch({ subtasks: [...current.subtasks, { done: false, text }] });
  });

  function renderSubtasks(task) {
    els.subtasks.textContent = '';
    task.subtasks.forEach((subtask, index) => {
      const li = document.createElement('li');
      if (subtask.done) li.className = 'done';

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = subtask.done;
      check.setAttribute('aria-label', `Mark "${subtask.text}" complete`);
      check.addEventListener('change', () => {
        const next = task.subtasks.map((s, i) => (i === index ? { ...s, done: check.checked } : s));
        patch({ subtasks: next });
      });

      const text = document.createElement('input');
      text.type = 'text';
      text.value = subtask.text;
      text.setAttribute('aria-label', 'Subtask');
      text.addEventListener('change', () => {
        const value = text.value.trim();
        const next = task.subtasks
          .map((s, i) => (i === index ? { ...s, text: value } : s))
          .filter((s) => s.text);
        patch({ subtasks: next });
      });

      const promote = document.createElement('button');
      promote.type = 'button';
      promote.className = 'icon';
      promote.textContent = '↗';
      promote.title = 'Promote to its own task';
      promote.addEventListener('click', () => handlers.onPromote?.(task.id, index));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'icon';
      remove.textContent = '✕';
      remove.title = 'Remove subtask';
      remove.addEventListener('click', () =>
        patch({ subtasks: task.subtasks.filter((_, i) => i !== index) })
      );

      li.append(check, text, promote, remove);
      els.subtasks.append(li);
    });
  }

  function fillRelationSelect(select, task, tasks, values) {
    select.textContent = '';
    for (const other of tasks) {
      if (other.id === task.id) continue;
      const option = document.createElement('option');
      option.value = other.id;
      option.textContent = other.title;
      option.selected = values.includes(other.id);
      select.append(option);
    }
  }

  function fillDatalist(list, values) {
    list.textContent = '';
    for (const value of values) {
      const option = document.createElement('option');
      option.value = value;
      list.append(option);
    }
  }

  return {
    /** Show `task`; pass null to hide the panel. */
    render({ task, tasks, people, projects, assistantReady }) {
      current = task;
      if (!task) {
        root.hidden = true;
        return;
      }
      root.hidden = false;
      if (document.activeElement !== els.title) els.title.value = task.title;
      els.done.checked = Boolean(task.done);
      els.due.value = task.due || '';
      els.estimate.value = task.estimate || '';
      els.estimate.setAttribute('list', 'estimate-options');
      els.projects.value = (task.project ?? []).join(', ');
      els.projects.setAttribute('list', 'project-list');
      els.people.value = (task.people ?? []).join(', ');
      els.people.setAttribute('list', 'people-list');
      els.notes.value = task.notes || '';
      fillRelationSelect(els.blocked, task, tasks, task.blockedBy ?? []);
      fillRelationSelect(els.partof, task, tasks, task.partOf ?? []);
      fillDatalist(els.peopleList, people);
      fillDatalist(els.projectList, projects);
      renderSubtasks(task);
      els.suggestSubtasks.disabled = !assistantReady;
      els.suggestEstimate.disabled = !assistantReady;
      const hint = assistantReady ? '' : 'Add an OpenRouter key in Settings first';
      els.suggestSubtasks.title = hint;
      els.suggestEstimate.title = hint;
    },
    focusTitle: () => els.title.focus(),
  };
}
