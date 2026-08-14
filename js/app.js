/* ============================================================
   LIFE DASHBOARD — app.js
   Single vanilla JS file. No frameworks, no build tools.
   Data persisted via localStorage.
   ============================================================ */

'use strict';

/* ============================================================
   STORAGE HELPERS
   ============================================================ */
const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },
};

const KEYS = {
  TODOS:  'dashboard_todos',
  LINKS:  'dashboard_links',
  THEME:  'dashboard_theme',
  NAME:   'dashboard_username',
  SORT:   'dashboard_sort',
};

/* ============================================================
   THEME  (dark / light toggle)
   ============================================================ */
const Theme = (() => {
  const html      = document.documentElement;
  const btnToggle = document.getElementById('theme-toggle');
  const elIcon    = document.getElementById('theme-icon');
  const elLabel   = document.getElementById('theme-label');

  function apply(theme) {
    html.setAttribute('data-theme', theme);
    if (theme === 'light') {
      elIcon.textContent  = '☀️';
      elLabel.textContent = 'Light';
    } else {
      elIcon.textContent  = '🌙';
      elLabel.textContent = 'Dark';
    }
  }

  function toggle() {
    const current = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    apply(current);
    Storage.set(KEYS.THEME, current);
  }

  function init() {
    const saved = Storage.get(KEYS.THEME, 'dark');
    apply(saved);
    btnToggle.addEventListener('click', toggle);
  }

  return { init };
})();

/* ============================================================
   GREETING  (clock + date + time-of-day message + custom name)
   ============================================================ */
const Greeting = (() => {
  const elTime       = document.getElementById('greeting-time');
  const elMessage    = document.getElementById('greeting-message');
  const elDate       = document.getElementById('greeting-date');
  const elNameDisplay = document.getElementById('greeting-name-display');
  const btnNameEdit  = document.getElementById('greeting-name-edit');

  // Name modal
  const elNameOverlay = document.getElementById('name-modal-overlay');
  const elNameInput   = document.getElementById('name-modal-input');
  const btnNameSave   = document.getElementById('name-modal-save');
  const btnNameCancel = document.getElementById('name-modal-cancel');

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function greetByHour(h) {
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }

  function greetEmoji(h) {
    if (h < 12) return '☀️';
    if (h < 17) return '🌤️';
    if (h < 21) return '🌆';
    return '🌙';
  }

  function renderGreeting(h) {
    const name = Storage.get(KEYS.NAME, '');
    const base = greetByHour(h);
    const emoji = greetEmoji(h);
    if (name) {
      elMessage.textContent = `${base}, ${name}! ${emoji}`;
      elNameDisplay.textContent = '';
    } else {
      elMessage.textContent = `${base}! ${emoji}`;
      elNameDisplay.textContent = 'Add your name →';
    }
  }

  function tick() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    elTime.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    renderGreeting(h);

    const dayName   = DAYS[now.getDay()];
    const monthName = MONTHS[now.getMonth()];
    elDate.textContent = `${dayName}, ${monthName} ${now.getDate()}, ${now.getFullYear()}`;
  }

  /* ---- name modal ---- */
  function openNameModal() {
    elNameInput.value = Storage.get(KEYS.NAME, '');
    elNameOverlay.classList.add('active');
    elNameInput.focus();
  }

  function closeNameModal() {
    elNameOverlay.classList.remove('active');
  }

  function saveName() {
    const name = elNameInput.value.trim();
    Storage.set(KEYS.NAME, name);
    closeNameModal();
    tick(); // re-render greeting immediately
  }

  function init() {
    tick();
    setInterval(tick, 1000);

    btnNameEdit.addEventListener('click', openNameModal);
    btnNameSave.addEventListener('click', saveName);
    btnNameCancel.addEventListener('click', closeNameModal);

    elNameInput.addEventListener('keydown', e => {
      if (e.key === 'Enter')  saveName();
      if (e.key === 'Escape') closeNameModal();
    });

    elNameOverlay.addEventListener('click', e => {
      if (e.target === elNameOverlay) closeNameModal();
    });
  }

  return { init };
})();

/* ============================================================
   FOCUS TIMER  (25-min Pomodoro-style)
   ============================================================ */
const Timer = (() => {
  const TOTAL    = 25 * 60;
  let remaining  = TOTAL;
  let intervalId = null;
  let running    = false;

  const elDisplay = document.getElementById('timer-display');
  const elLabel   = document.getElementById('timer-label');
  const elCard    = document.querySelector('.timer-card');
  const btnStart  = document.getElementById('timer-start');
  const btnStop   = document.getElementById('timer-stop');
  const btnReset  = document.getElementById('timer-reset');

  function pad(n) { return String(n).padStart(2, '0'); }

  function render() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    elDisplay.textContent = `${pad(m)}:${pad(s)}`;
  }

  function setLabel(text) { elLabel.textContent = text; }

  function tick() {
    if (remaining <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      running    = false;
      remaining  = 0;
      render();
      setLabel('Session complete! 🎉');
      elCard.classList.remove('running');
      if (Notification.permission === 'granted') {
        new Notification('Focus session complete! Take a break. 🎉');
      }
      return;
    }
    remaining--;
    render();
  }

  function start() {
    if (running) return;
    if (remaining === 0) remaining = TOTAL;
    running = true;
    elCard.classList.add('running');
    setLabel('Stay focused…');
    intervalId = setInterval(tick, 1000);
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function stop() {
    if (!running) return;
    clearInterval(intervalId);
    intervalId = null;
    running    = false;
    elCard.classList.remove('running');
    setLabel('Paused');
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    running    = false;
    remaining  = TOTAL;
    render();
    setLabel('Ready to focus');
    elCard.classList.remove('running');
  }

  function init() {
    render();
    btnStart.addEventListener('click', start);
    btnStop.addEventListener('click',  stop);
    btnReset.addEventListener('click', reset);
  }

  return { init };
})();

/* ============================================================
   TO-DO LIST  (with sort)
   ============================================================ */
const Todos = (() => {
  let todos     = Storage.get(KEYS.TODOS, []); // [{ id, text, done }]
  let editingId = null;

  const elList    = document.getElementById('todo-list');
  const elInput   = document.getElementById('todo-input');
  const btnAdd    = document.getElementById('todo-add');
  const elFooter  = document.getElementById('todo-footer');
  const elSort    = document.getElementById('sort-select');

  // Modal
  const elOverlay = document.getElementById('modal-overlay');
  const elModalIn = document.getElementById('modal-input');
  const btnSave   = document.getElementById('modal-save');
  const btnCancel = document.getElementById('modal-cancel');

  /* ---- persistence ---- */
  function save() { Storage.set(KEYS.TODOS, todos); }

  /* ---- sort ---- */
  function getSorted() {
    const mode = elSort.value;
    const copy = [...todos];
    if (mode === 'az')      return copy.sort((a, b) => a.text.localeCompare(b.text));
    if (mode === 'za')      return copy.sort((a, b) => b.text.localeCompare(a.text));
    if (mode === 'pending') return copy.sort((a, b) => Number(a.done) - Number(b.done));
    if (mode === 'done')    return copy.sort((a, b) => Number(b.done) - Number(a.done));
    return copy; // 'default' — insertion order
  }

  /* ---- rendering ---- */
  function renderFooter() {
    const total = todos.length;
    const done  = todos.filter(t => t.done).length;
    elFooter.textContent = total === 0 ? '' : `${done} / ${total} completed`;
  }

  function render() {
    elList.innerHTML = '';

    if (todos.length === 0) {
      elList.innerHTML = '<li class="todo-empty">No tasks yet. Add one above!</li>';
      renderFooter();
      return;
    }

    getSorted().forEach(todo => {
      const li = document.createElement('li');
      li.className  = `todo-item${todo.done ? ' done' : ''}`;
      li.dataset.id = todo.id;

      // Checkbox
      const cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'todo-checkbox';
      cb.checked   = todo.done;
      cb.setAttribute('aria-label', 'Mark task as done');
      cb.addEventListener('change', () => toggleDone(todo.id));

      // Text
      const span = document.createElement('span');
      span.className   = 'todo-text';
      span.textContent = todo.text;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn-icon';
      btnEdit.textContent = '✏️';
      btnEdit.setAttribute('aria-label', 'Edit task');
      btnEdit.addEventListener('click', () => openEditModal(todo.id));

      const btnDel = document.createElement('button');
      btnDel.className = 'btn-icon btn-delete';
      btnDel.textContent = '🗑️';
      btnDel.setAttribute('aria-label', 'Delete task');
      btnDel.addEventListener('click', () => deleteTask(todo.id));

      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(actions);
      elList.appendChild(li);
    });

    renderFooter();
  }

  /* ---- actions ---- */
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    todos.push({ id: Date.now().toString(), text: trimmed, done: false });
    save();
    render();
  }

  function toggleDone(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    todo.done = !todo.done;
    save();
    render();
  }

  function deleteTask(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  /* ---- edit modal ---- */
  function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    editingId = id;
    elModalIn.value = todo.text;
    elOverlay.classList.add('active');
    elModalIn.focus();
  }

  function closeModal() {
    editingId = null;
    elOverlay.classList.remove('active');
  }

  function saveEdit() {
    const trimmed = elModalIn.value.trim();
    if (!trimmed || !editingId) return;
    const todo = todos.find(t => t.id === editingId);
    if (todo) { todo.text = trimmed; save(); render(); }
    closeModal();
  }

  /* ---- event listeners ---- */
  function init() {
    // Restore saved sort preference
    const savedSort = Storage.get(KEYS.SORT, 'default');
    elSort.value = savedSort;

    render();

    btnAdd.addEventListener('click', () => {
      addTask(elInput.value);
      elInput.value = '';
      elInput.focus();
    });

    elInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { addTask(elInput.value); elInput.value = ''; }
    });

    elSort.addEventListener('change', () => {
      Storage.set(KEYS.SORT, elSort.value);
      render();
    });

    btnSave.addEventListener('click', saveEdit);
    btnCancel.addEventListener('click', closeModal);

    elModalIn.addEventListener('keydown', e => {
      if (e.key === 'Enter')  saveEdit();
      if (e.key === 'Escape') closeModal();
    });

    elOverlay.addEventListener('click', e => {
      if (e.target === elOverlay) closeModal();
    });
  }

  return { init };
})();

/* ============================================================
   QUICK LINKS
   ============================================================ */
const Links = (() => {
  let links = Storage.get(KEYS.LINKS, []); // [{ id, name, url }]

  const elGrid = document.getElementById('links-grid');
  const elName = document.getElementById('link-name');
  const elUrl  = document.getElementById('link-url');
  const btnAdd = document.getElementById('link-add');

  function save() { Storage.set(KEYS.LINKS, links); }

  function render() {
    elGrid.innerHTML = '';

    if (links.length === 0) {
      elGrid.innerHTML = '<span class="links-empty">No links yet. Add your favourites!</span>';
      return;
    }

    links.forEach(link => {
      const wrapper = document.createElement('div');
      wrapper.className = 'link-btn-wrapper';

      const a = document.createElement('a');
      a.className  = 'link-btn';
      a.href       = link.url;
      a.target     = '_blank';
      a.rel        = 'noopener noreferrer';
      a.textContent = link.name;

      const delBtn = document.createElement('button');
      delBtn.className = 'link-delete-btn';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', `Remove ${link.name}`);
      delBtn.addEventListener('click', e => {
        e.preventDefault();
        deleteLink(link.id);
      });

      wrapper.appendChild(a);
      wrapper.appendChild(delBtn);
      elGrid.appendChild(wrapper);
    });
  }

  function addLink(name, url) {
    const trimName = name.trim();
    let   trimUrl  = url.trim();

    if (!trimName || !trimUrl) {
      alert('Please fill in both a label and a URL.');
      return;
    }
    if (!/^https?:\/\//i.test(trimUrl)) {
      trimUrl = 'https://' + trimUrl;
    }
    try {
      new URL(trimUrl);
    } catch {
      alert('Please enter a valid URL (e.g. https://example.com).');
      return;
    }

    links.push({ id: Date.now().toString(), name: trimName, url: trimUrl });
    save();
    render();
  }

  function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    save();
    render();
  }

  function init() {
    render();

    btnAdd.addEventListener('click', () => {
      addLink(elName.value, elUrl.value);
      elName.value = '';
      elUrl.value  = '';
      elName.focus();
    });

    elUrl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        addLink(elName.value, elUrl.value);
        elName.value = '';
        elUrl.value  = '';
        elName.focus();
      }
    });
  }

  return { init };
})();

/* ============================================================
   BOOTSTRAP
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Greeting.init();
  Timer.init();
  Todos.init();
  Links.init();
});
