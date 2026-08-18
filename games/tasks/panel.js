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
    working: $('t-working'),
    due: $('t-due'),
    estimate: $('t-estimate'),
    projects: $('t-projects'),
    people: $('t-people'),
    peopleForm: $('t-people-form'),
    peopleNew: $('t-people-new'),
    blocked: $('t-blocked'),
    blockedForm: $('t-blocked-form'),
    blockedNew: $('t-blocked-new'),
    blockedOptions: $('blocked-options'),
    partof: $('t-partof'),
    partofForm: $('t-partof-form'),
    partofNew: $('t-partof-new'),
    partofOptions: $('partof-options'),
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
  /** Per-render lookups the add boxes resolve a typed name against. */
  let byId = new Map();
  let eligible = { blockedBy: [], partOf: [] };

  const patch = (changes) => {
    if (current) handlers.onChange?.(current.id, changes);
  };

  els.title.addEventListener('change', () => patch({ title: els.title.value.trim() }));
  els.done.addEventListener('change', () => patch({ done: els.done.checked }));
  // Routed to the board rather than patched: only one task can be the one in hand, which
  // is a fact about every task and not just this one.
  els.working.addEventListener('change', () => current && handlers.onWorking?.(current.id));
  els.due.addEventListener('change', () => patch({ due: els.due.value }));
  els.estimate.addEventListener('change', () => patch({ estimate: els.estimate.value.trim() }));
  els.projects.addEventListener('change', () => patch({ project: splitList(els.projects.value) }));
  els.notes.addEventListener('change', () => patch({ notes: els.notes.value }));

  /**
   * Add boxes take a title, since that is what the datalist offers and what the board
   * shows; ids are an implementation detail nobody types. An id is accepted too, so a
   * name copied out of a vault file still works.
   */
  function resolve(text, field) {
    const wanted = text.trim().toLowerCase();
    if (!wanted) return null;
    const options = eligible[field] ?? [];
    return (
      options.find((t) => t.title.toLowerCase() === wanted) ??
      options.find((t) => t.id.toLowerCase() === wanted) ??
      null
    );
  }

  function bindRelationForm(form, input, field, noun) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text || !current) return;
      const match = resolve(text, field);
      if (!match) {
        // Either it does not exist here, or taking it would close a loop. `cyclicRefs`
        // owns that call; the panel only reports that the name is not on offer.
        handlers.onMessage?.(`No ${noun} called “${text}” is available for this task.`);
        return;
      }
      input.value = '';
      patch({ [field]: [...(current[field] ?? []), match.id] });
    });
  }

  bindRelationForm(els.blockedForm, els.blockedNew, 'blockedBy', 'task');
  bindRelationForm(els.partofForm, els.partofNew, 'partOf', 'task');

  els.peopleForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = els.peopleNew.value.trim();
    if (!name || !current) return;
    els.peopleNew.value = '';
    handlers.onAddPerson?.(current.id, name);
  });

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

  /**
   * One removable chip per reference, labelled by title and opening that task when
   * clicked. A reference to something outside the current project is shown by id rather
   * than hidden, since it is still real and still has to be removable.
   */
  function renderRelation(list, task, field) {
    const refs = task[field] ?? [];
    list.textContent = '';
    for (const ref of refs) {
      const li = document.createElement('li');
      const other = byId.get(ref);
      if (!other) li.className = 'absent';

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'chip-link';
      open.textContent = other ? other.title : ref;
      if (other) {
        open.title = `Open “${other.title}”`;
        open.addEventListener('click', () => handlers.onSelect?.(ref));
      } else {
        open.title = `${ref} is not on this board`;
        open.disabled = true;
      }

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'chip-remove';
      remove.textContent = '✕';
      remove.title = 'Remove';
      remove.addEventListener('click', () => patch({ [field]: refs.filter((r) => r !== ref) }));

      li.append(open, remove);
      list.append(li);
    }
  }

  /**
   * The project's people as toggles: filled when they hold this task, outlined when they
   * do not. Anyone assigned here but unconnected to the project is appended and marked,
   * so an imported assignment is visible and can be taken off.
   */
  function renderPeople(task, roster) {
    const assigned = task.people ?? [];
    const known = new Set(roster.map((p) => p.name));
    const names = [...roster.map((p) => p.name), ...assigned.filter((n) => !known.has(n))];
    els.people.textContent = '';

    for (const name of names) {
      const on = assigned.includes(name);
      const li = document.createElement('li');
      li.className = [on ? 'on' : '', known.has(name) ? '' : 'absent'].filter(Boolean).join(' ');

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'chip-toggle';
      toggle.textContent = name;
      toggle.setAttribute('aria-pressed', String(on));
      toggle.title = on
        ? `${name} holds this task — click to unassign`
        : `Assign this task to ${name}`;
      toggle.addEventListener('click', () =>
        patch({ people: on ? assigned.filter((n) => n !== name) : [...assigned, name] })
      );

      li.append(toggle);
      els.people.append(li);
    }

    // Why there are no toggles, which is not the same as nobody being assigned.
    if (!names.length) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'Nobody on this project yet.';
      els.people.append(empty);
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
    render({ task, tasks, allTasks, roster, people, projects, eligible: options, assistantReady }) {
      current = task;
      if (!task) {
        root.hidden = true;
        return;
      }
      root.hidden = false;
      byId = new Map((allTasks ?? tasks).map((t) => [t.id, t]));
      eligible = options ?? { blockedBy: [], partOf: [] };
      if (document.activeElement !== els.title) els.title.value = task.title;
      els.done.checked = Boolean(task.done);
      els.working.checked = Boolean(task.working);
      els.due.value = task.due || '';
      els.estimate.value = task.estimate || '';
      els.estimate.setAttribute('list', 'estimate-options');
      els.projects.value = (task.project ?? []).join(', ');
      els.projects.setAttribute('list', 'project-list');
      els.notes.value = task.notes || '';
      renderPeople(task, roster ?? []);
      renderRelation(els.blocked, task, 'blockedBy');
      renderRelation(els.partof, task, 'partOf');
      fillDatalist(els.blockedOptions, eligible.blockedBy.map((t) => t.title));
      fillDatalist(els.partofOptions, eligible.partOf.map((t) => t.title));
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
