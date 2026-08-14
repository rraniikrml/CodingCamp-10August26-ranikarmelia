# Implementation Plan: To-Do List Life Dashboard

## Overview

Build a self-contained, client-side productivity dashboard as three plain files (`index.html`,
`css/style.css`, `js/app.js`) with no build step and no external runtime dependencies. All
persistent state is stored in `localStorage`. The implementation follows the module structure
defined in the design document: `StorageService`, `UIHelpers`, `ClockModule`, `TimerModule`,
`TaskModule`, `LinkModule`, and a top-level `init()` wiring function.

Property-based tests use **fast-check** (installed as a dev dependency via npm; tests run with
`node --experimental-vm-modules node_modules/.bin/jest` or equivalent). Unit tests use **Jest**
with **jsdom**.

---

## Tasks

- [x] 1. Scaffold project structure and create empty entry-point files
  - Create `index.html` at project root (empty HTML5 boilerplate)
  - Create `css/style.css` (empty file)
  - Create `js/app.js` (empty file)
  - Create `tests/` directory with `unit/` and `property/` sub-directories
  - Create `package.json` with Jest + jsdom + fast-check dev dependencies, and a `test` script
  - Create `jest.config.js` configured for jsdom test environment
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 2. Build HTML skeleton — static structure and all section anchors
  - [x] 2.1 Write the full `index.html` structure
    - Add `<head>` with charset, viewport meta, title, and `<link>` to `css/style.css`
    - Add `<body>` with `#app` root element
    - Add `#browser-warning` banner (hidden by default)
    - Add `#clock-section` containing `#clock-time`, `#clock-date`
    - Add `#greeting-section` containing `#greeting`
    - Add `#timer-section` containing `#timer-display`, `#timer-duration`, `#timer-error`, `#btn-start`, `#btn-stop`, `#btn-reset`
    - Add `#task-section` containing `#task-input`, `#btn-add-task`, `#task-error`, `#task-list`, `#task-empty`
    - Add `#links-section` containing `#link-label`, `#link-url`, `#btn-add-link`, `#link-error`, `#quick-links`, `#links-empty`
    - Add `#error-banner` dismissible global error element (hidden by default)
    - Add `<script src="js/app.js" defer></script>`
    - All interactive elements have `aria-label` or associated `<label>` for accessibility
    - _Requirements: 15.1, 15.2, 15.3, 6.3, 3.3, 11.1, 16.1_

- [ ] 3. Implement CSS base styles, layout, and responsive design
  - [x] 3.1 Write CSS custom properties, typography, and global reset
    - Define `--space-sm` (8 px), `--space-md` (16 px), `--space-lg` (24 px) custom properties
    - Set `body` font-size with `clamp(14px, 1.5vw, 18px)` and `line-height: 1.5`
    - Apply a dark neutral background with off-white text satisfying WCAG 2.1 AA (≥ 4.5:1)
    - Define `:focus-visible` outline ≥ 2 px on all interactive elements
    - _Requirements: 18.1, 18.2, 16.3_

  - [x] 3.2 Implement CSS Grid macro layout and section boundaries
    - Apply `display: grid` with `grid-template-areas` on `#app` for the four-quadrant layout
    - Separate adjacent sections with ≥ 16 px gap; no section overlaps at any viewport width
    - Give each section a visible boundary (border or background colour change)
    - _Requirements: 18.3, 18.4_

  - [~] 3.3 Implement responsive breakpoints and Flexbox intra-section layout
    - At ≥ 768 px: two-column grid — `#task-section` left, `#links-section` right
    - At < 768 px: single-column stack, all sections full width
    - Use Flexbox inside each section for button rows, task items, and link items
    - Verify no horizontal scroll at 320 px minimum width
    - _Requirements: 16.3, 16.5, 18.4_

- [x] 4. Implement `StorageService`
  - [x] 4.1 Write `StorageService` with typed read/write methods
    - Define `KEYS` object: `{ TASKS: 'dashboard_tasks', LINKS: 'quickLinks' }`
    - Implement `readTasks()`: wraps `JSON.parse(localStorage.getItem(KEYS.TASKS))`; returns `Task[]` or `null`; on parse error deletes the key and returns `null`
    - Implement `writeTasks(tasks)`: wraps `localStorage.setItem` in `try/catch`; returns `true` on success, `false` on failure
    - Implement `readLinks()` and `writeLinks(links)` following the same pattern for `KEYS.LINKS`
    - _Requirements: 10.3, 10.4, 14.4, 14.5_

  - [ ]* 4.2 Write property test for `StorageService` — task persistence round-trip (Property 3)
    - **Property 3: Task persistence round-trip**
    - Use `fc.array(taskArb)` to generate arbitrary task arrays; write then read back and assert deep equality of IDs, text, completion states, and timestamps
    - Tag: `// Feature: todo-life-dashboard, Property 3: Task persistence round-trip`
    - **Validates: Requirements 10.3**

  - [ ]* 4.3 Write property test for `StorageService` — link persistence round-trip (Property 9)
    - **Property 9: Link addition round-trip**
    - Use `fc.array(linkArb)` to generate arbitrary link arrays; write then read back and assert label and normalised URL equality
    - Tag: `// Feature: todo-life-dashboard, Property 9: Link addition round-trip`
    - **Validates: Requirements 11.2, 14.4, 14.5**

  - [ ]* 4.4 Write unit tests for `StorageService` error paths
    - Test that `readTasks()` returns `null` and removes the key when stored value is malformed JSON
    - Test that `writeTasks()` returns `false` when `localStorage.setItem` throws (mock via `jest.spyOn`)
    - _Requirements: 10.4, 14.3_

- [ ] 5. Implement `UIHelpers`
  - [~] 5.1 Write `UIHelpers` utility functions
    - Implement `showError(elementId, message)`: sets `.textContent` and removes `hidden` attribute on the target element
    - Implement `clearError(elementId)`: sets `.textContent = ''` and adds `hidden` attribute
    - Implement `showAlert(message, durationMs)`: renders message in `#error-banner`, auto-hides after `durationMs` (default 5000), returns a dismiss function
    - Implement `confirmDialog(message)`: returns `window.confirm(message)` (synchronous; replaceable in tests)
    - Implement `sanitiseText(raw)`: trims whitespace; returns the trimmed string (callers validate length)
    - _Requirements: 5.3, 5.4, 8.5, 9.1, 10.5_

  - [ ]* 5.2 Write unit tests for `UIHelpers`
    - Test `showError` / `clearError` DOM mutations
    - Test `showAlert` hides banner after specified duration (use fake timers)
    - Test `sanitiseText` with leading/trailing whitespace and Unicode whitespace characters
    - _Requirements: 5.3, 8.5_

- [ ] 6. Implement `ClockModule`
  - [~] 6.1 Write `ClockModule.tick()` and `ClockModule.updateGreeting()`
    - `tick()` reads `new Date()`, formats time with `toLocaleTimeString()` → `#clock-time`, date with `toLocaleDateString({ weekday:'long', day:'numeric', month:'long', year:'numeric' })` → `#clock-date`; calls `updateGreeting(date.getHours())`
    - `updateGreeting(hour)`: 5–11 → "Good morning", 12–17 → "Good afternoon", 18–23 and 0–4 → "Good evening"; sets `#greeting` text
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

  - [~] 6.2 Write `ClockModule.init()` and visibility change handler
    - `init()` calls `tick()` immediately (Req 2.5), then starts `setInterval(tick, 1000)`
    - Attaches `visibilitychange` listener: on `'visible'`, calls `requestAnimationFrame(() => tick())`
    - On init, if `Intl` or `toLocaleTimeString` throws (timezone unavailable), display UTC time with "+00:00" suffix on `#clock-time`; show "Hello" in `#greeting`
    - _Requirements: 1.3, 1.4, 1.5, 2.4, 2.5, 2.6_

  - [ ]* 6.3 Write property test for `ClockModule.updateGreeting()` — greeting totality (Property 7)
    - **Property 7: Greeting is total and correct over 24-hour input space**
    - Use `fc.integer({ min: 0, max: 23 })` to assert correct bucket for every hour, no empty or undefined result
    - Tag: `// Feature: todo-life-dashboard, Property 7: Greeting totality`
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 6.4 Write unit tests for `ClockModule`
    - Test `toLocaleTimeString` / `toLocaleDateString` output for a fixed known `Date` object
    - Test UTC fallback path when `Intl` throws
    - Test that greeting updates when crossing a boundary (mock `Date`)
    - _Requirements: 1.1, 1.2, 1.5, 2.4_

- [~] 7. Checkpoint — ensure all tests pass to this point
  - Ensure all tests pass; ask the user if questions arise.

- [ ] 8. Implement `TimerModule`
  - [~] 8.1 Write `TimerModule` state machine, `formatSeconds()`, and display helpers
    - Define state: `'idle' | 'running' | 'paused' | 'expired'`; `defaultDuration = 1500`; `remaining = 1500`
    - Implement `formatSeconds(s)`: zero-pads minutes and seconds → `MM:SS` string
    - Implement `syncButtons()`: enable/disable `#btn-start`, `#btn-stop`, `#btn-reset` according to current state (Req 3.3, 4.4, 4.5)
    - Implement `init()`: render display, call `syncButtons()`, attach duration-change handler
    - _Requirements: 3.1, 3.2, 3.3, 4.4, 4.5_

  - [ ]* 8.2 Write property test for `TimerModule.formatSeconds()` — display format (Property 10)
    - **Property 10: Timer display format is always MM:SS**
    - Use `fc.integer({ min: 0, max: 3600 })` and assert output matches `/^\d{2}:\d{2}$/` with SS in [00, 59]
    - Tag: `// Feature: todo-life-dashboard, Property 10: Timer display format`
    - **Validates: Requirements 3.2**

  - [~] 8.3 Write `TimerModule.setDuration()`, `start()`, `stop()`, `reset()`, and `tick()`
    - `setDuration(seconds)`: validates range [60, 3600]; on rejection shows error in `#timer-error`; on acceptance updates `defaultDuration` and `remaining`, updates display, calls `syncButtons()`
    - `start()`: if expired, reset first; transition to `'running'`; start `setInterval(tick, 1000)`; call `syncButtons()`
    - `stop()`: clear interval; transition to `'paused'`; call `syncButtons()`
    - `reset()`: clear interval; set `remaining = defaultDuration`; transition to `'idle'`; update display; call `syncButtons()`
    - `tick()`: decrement `remaining`; update display; if `remaining === 0` call `notifyExpiry()` and transition to `'expired'`
    - _Requirements: 3.4, 3.5, 4.1, 4.2, 4.3, 4.8_

  - [ ]* 8.4 Write property test for `TimerModule.setDuration()` — duration validation (Property 11)
    - **Property 11: Timer duration validation rejects out-of-range values**
    - Use `fc.integer({ min: -1000, max: 5000 })`; assert values outside [60, 3600] are rejected and `defaultDuration` is unchanged; values inside are accepted
    - Tag: `// Feature: todo-life-dashboard, Property 11: Duration validation`
    - **Validates: Requirements 3.4, 3.5**

  - [~] 8.5 Write `TimerModule.notifyExpiry()`
    - Request notification permission if not already decided; if `'granted'` fire a `Notification`; else call `UIHelpers.showAlert('Session complete!', 5000)` which stays visible until dismissed
    - _Requirements: 4.6, 4.7_

  - [ ]* 8.6 Write unit tests for `TimerModule` state machine
    - Test all valid transitions: idle → running, running → paused, paused → running, any → reset, running → expired
    - Test that expired state causes `start()` to reset first (Req 4.8)
    - Test that `notifyExpiry` falls back to on-screen alert when notification permission is denied
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 9. Implement `TaskModule`
  - [~] 9.1 Write `TaskModule.init()` and `render()` / `renderItem()`
    - `init()`: call `StorageService.readTasks()`; on `null` show load error in `#task-error` and set `tasks = []`; otherwise set `tasks` and sort ascending by `createdAt`; call `render()`
    - `render()`: rebuild `#task-list` DOM from `tasks[]` using `renderItem()`; toggle `#task-empty` visibility
    - `renderItem(task)`: returns a `<li>` with `data-task-id` attribute containing toggle, text span, edit button, delete button; applies strikethrough + opacity 0.5 for completed tasks
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.1, 10.2_

  - [~] 9.2 Write `TaskModule.add(text)`
    - Validate: trimmed length 1–500 chars; on failure show error in `#task-error` and keep focus on `#task-input`
    - Create `Task` with `crypto.randomUUID()`, trimmed text, `completed: false`, `createdAt: Date.now()`, `updatedAt: Date.now()`
    - Call `StorageService.writeTasks([...tasks, newTask])`; on success update `tasks` and call `render()`; on failure show error banner and do not mutate `tasks`
    - Clear `#task-input` and return focus to it
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ]* 9.3 Write property test for `TaskModule.add()` — list grows by exactly one (Property 1)
    - **Property 1: Task addition grows the list by exactly one**
    - Use `fc.array(taskArb)` and `fc.string({ minLength: 1, maxLength: 500 })` (non-whitespace-only); assert `tasks.length` increases by exactly one and new task text equals trimmed input
    - Tag: `// Feature: todo-life-dashboard, Property 1: Task addition grows list`
    - **Validates: Requirements 5.2**

  - [ ]* 9.4 Write property test for `TaskModule.add()` — whitespace rejection (Property 2)
    - **Property 2: Whitespace-only and empty inputs are rejected**
    - Use `fc.stringOf(fc.constantFrom(' ', '\t', '\n'))` (including empty string); assert `tasks.length` is unchanged
    - Tag: `// Feature: todo-life-dashboard, Property 2: Whitespace rejection`
    - **Validates: Requirements 5.3**

  - [~] 9.5 Write `TaskModule.toggle(id)`
    - Find task by ID; flip `completed` and update `updatedAt`
    - Call `StorageService.writeTasks(tasks)`; on success update in-memory task and call `render()`; on failure revert `completed` and show error banner
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 9.6 Write property test for `TaskModule.toggle()` — double-toggle is identity (Property 4)
    - **Property 4: Completion toggle is its own inverse**
    - Use `fc.record({ id: fc.uuid(), completed: fc.boolean(), ... })`; call `toggle` twice and assert final `completed` equals original; call once and assert `completed` is flipped
    - Tag: `// Feature: todo-life-dashboard, Property 4: Toggle is self-inverse`
    - **Validates: Requirements 7.1, 7.2**

  - [~] 9.7 Write `TaskModule.startEdit()`, `saveEdit()`, and `cancelEdit()`
    - `startEdit(id)`: replace task text span with inline `<input>` pre-filled with current text, cursor at end; show Save and Cancel buttons; hide edit and delete buttons
    - `saveEdit(id, text)`: validate trimmed length 1–500; on failure show inline error and keep focus; on success update task `text` and `updatedAt`, call `StorageService.writeTasks()`; on storage failure revert text and show error; call `render()`
    - `cancelEdit(id)`: discard changes and call `render()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 9.8 Write property test for `TaskModule.saveEdit()` — edit preserves identity (Property 5)
    - **Property 5: Task edit preserves identity and updates text**
    - Use `fc.uuid()` and `fc.string({ minLength: 1, maxLength: 500 })`; assert `id`, `completed`, `createdAt` unchanged after save; `text` equals trimmed new value
    - Tag: `// Feature: todo-life-dashboard, Property 5: Edit preserves identity`
    - **Validates: Requirements 8.3**

  - [~] 9.9 Write `TaskModule.delete(id)`
    - Call `UIHelpers.confirmDialog()`; on cancel do nothing
    - On confirm: remove task from `tasks`; call `StorageService.writeTasks()`; on success call `render()`; on storage failure re-add the task to `tasks` and show error banner
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 9.10 Write property test for `TaskModule.delete()` — deleted task is absent (Property 6)
    - **Property 6: Deleted task is absent from the list**
    - Use `fc.array(taskArb, { minLength: 1 })` and `fc.nat()` (index); assert target ID absent after delete; all other tasks unchanged
    - Tag: `// Feature: todo-life-dashboard, Property 6: Delete removes target`
    - **Validates: Requirements 9.2**

  - [ ]* 9.11 Write unit tests for `TaskModule` error paths
    - Test storage write failure during `add()` reverts task list and shows banner
    - Test storage write failure during `toggle()` reverts completion state
    - Test storage write failure during `saveEdit()` preserves previous text
    - Test storage write failure during `delete()` restores the task
    - Test load failure (`readTasks()` returns `null`) initialises empty list with error message
    - _Requirements: 5.7, 7.4, 8.7, 10.4, 10.5_

- [~] 10. Checkpoint — ensure all tests pass to this point
  - Ensure all tests pass; ask the user if questions arise.

- [ ] 11. Implement `LinkModule`
  - [~] 11.1 Write `LinkModule.normaliseUrl(raw)` and `LinkModule.init()` / `render()` / `renderItem()`
    - `normaliseUrl(raw)`: if raw starts with `'http://'` or `'https://'` return unchanged; otherwise prepend `'https://'`; applying normalisation twice returns same result
    - `init()`: call `StorageService.readLinks()`; on `null` show load error and set `links = []`; call `render()`
    - `render()`: rebuild `#quick-links` DOM from `links[]` using `renderItem()`; toggle `#links-empty` visibility
    - `renderItem(link)`: returns a button with `data-link-id` attribute showing label text, plus a delete control (visible on hover/focus) with `aria-label`
    - _Requirements: 11.6, 12.1, 12.2, 13.1, 14.1, 14.2_

  - [ ]* 11.2 Write property test for `LinkModule.normaliseUrl()` — idempotence (Property 8)
    - **Property 8: URL scheme normalisation is idempotent**
    - Use `fc.webUrl()` (already has scheme) and `fc.string()`; assert already-schemed URLs return unchanged; assert double-normalisation equals single normalisation
    - Tag: `// Feature: todo-life-dashboard, Property 8: URL normalisation idempotent`
    - **Validates: Requirements 11.6**

  - [~] 11.3 Write `LinkModule.add(label, url)`
    - Validate label: 1–50 chars; validate URL: 1–2048 chars after normalisation; on any failure show inline error adjacent to the offending field; do not create link
    - Enforce maximum of 50 links in collection; reject beyond that with an error message
    - Create `Link` with `crypto.randomUUID()`, label, normalised URL, `createdAt: Date.now()`
    - Call `StorageService.writeLinks([...links, newLink])`; on success update `links` and call `render()`; on failure show error banner
    - Reset `#link-label`, `#link-url` inputs after successful add
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [~] 11.4 Write `LinkModule.delete(id)` and `LinkModule.open(url)`
    - `delete(id)`: call `UIHelpers.confirmDialog()`; on confirm remove from `links`, call `StorageService.writeLinks()`; on storage failure revert and show banner; call `render()`
    - `open(url)`: call `window.open(url, '_blank')`; if return is `null` (blocked) show error message via `UIHelpers.showAlert()`
    - _Requirements: 12.1, 12.3, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 11.5 Write unit tests for `LinkModule`
    - Test `add()` with empty label, empty URL, label > 50 chars, URL > 2048 chars — each shows the correct field-level error
    - Test `delete()` cancel leaves link intact; confirm removes it
    - Test `open()` shows error when `window.open` returns `null`
    - Test load failure initialises empty links with error message
    - _Requirements: 11.3, 11.4, 12.3, 13.2, 13.5, 14.3_

- [ ] 12. Wire all modules, attach event listeners, and add keyboard shortcuts
  - [~] 12.1 Write top-level `init()` function and feature detection
    - Detect `localStorage`, `Notification`, `crypto.randomUUID`; if any missing show `#browser-warning` with minimum version list; do not initialise further
    - Call `StorageService` (no init needed), `UIHelpers` (no init needed), then `ClockModule.init()`, `TimerModule.init()`, `TaskModule.init()`, `LinkModule.init()`
    - Attach `DOMContentLoaded` listener to call `init()`
    - _Requirements: 15.4, 15.5, 16.2, 16.4_

  - [~] 12.2 Attach event delegation listeners for task list and timer controls
    - Attach delegated `click` listener on `#task-list` using `closest('[data-task-id]')` to route toggle, edit, save, cancel, and delete actions to `TaskModule`
    - Attach `click` listeners on `#btn-start`, `#btn-stop`, `#btn-reset` to `TimerModule`
    - Attach `input` event on `#timer-duration` to validate and call `TimerModule.setDuration()`
    - _Requirements: 4.1, 4.2, 4.3, 7.1, 7.2, 8.1, 9.1_

  - [~] 12.3 Attach event delegation listener for quick-links panel and add-link form
    - Attach delegated `click` listener on `#quick-links` using `closest('[data-link-id]')` to route open and delete actions to `LinkModule`
    - Attach `click` on `#btn-add-link` and `submit`/`keydown Enter` on `#link-label` and `#link-url` to call `LinkModule.add()`
    - _Requirements: 11.1, 11.2, 12.1, 13.1, 13.2_

  - [~] 12.4 Attach keyboard shortcut listeners
    - `#task-input` keydown Enter → `TaskModule.add()`
    - Inline task edit field keydown Enter → `TaskModule.saveEdit()`; keydown Escape → `TaskModule.cancelEdit()`
    - `#link-label` and `#link-url` keydown Enter → `LinkModule.add()`
    - _Requirements: 5.2, 8.3, 8.4_

- [~] 13. Final checkpoint — ensure all tests pass
  - Run the full test suite (`npm test`); ensure all tests pass; verify no console errors when opening `index.html` in Chrome, Firefox, Edge, and Safari; ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build.
- Each task references specific requirements for traceability.
- Checkpoints (tasks 7, 10, 13) validate incremental progress and keep the build green.
- Property tests use **fast-check** with a minimum of 100 iterations per property.
- Unit tests use **Jest** with **jsdom** for DOM-dependent modules.
- The design has 12 correctness properties (P1–P12); all are covered by property test sub-tasks above.
- `StorageService` write-before-mutate pattern (step 2 → 3 → 4 in the design's mutation pattern) is enforced in every CRUD sub-task.
- No build tool or bundler is needed; `js/app.js` is loaded as a plain `<script>` tag.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["3.2", "4.1"] },
    { "id": 3, "tasks": ["3.3", "4.2", "4.3", "4.4", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "8.1"] },
    { "id": 6, "tasks": ["6.3", "6.4", "8.2", "8.3"] },
    { "id": 7, "tasks": ["8.4", "8.5", "9.1"] },
    { "id": 8, "tasks": ["8.6", "9.2", "11.1"] },
    { "id": 9, "tasks": ["9.3", "9.4", "9.5", "11.2", "11.3"] },
    { "id": 10, "tasks": ["9.6", "9.7", "11.4"] },
    { "id": 11, "tasks": ["9.8", "9.9", "11.5"] },
    { "id": 12, "tasks": ["9.10", "9.11", "12.1"] },
    { "id": 13, "tasks": ["12.2", "12.3"] },
    { "id": 14, "tasks": ["12.4"] }
  ]
}
```
