# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application that serves as a personal productivity
hub accessible from any modern browser. It combines a live clock and greeting, a Pomodoro-style focus
timer, a persistent to-do list, and a configurable quick-links panel — all stored in the browser's
Local Storage so no backend server or account is required. The application is delivered as a single
HTML page with one CSS file and one JavaScript file, and can be used as a standalone web app or
packaged as a browser extension.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **App**: Synonym for Dashboard; used interchangeably.
- **Timer**: The Pomodoro-style countdown component of the Dashboard.
- **Task**: A single to-do item managed by the Dashboard.
- **Task_List**: The collection of all Tasks stored by the Dashboard.
- **Link**: A user-defined URL and label stored in the Quick_Links panel.
- **Quick_Links**: The panel of user-defined shortcut buttons on the Dashboard.
- **Local_Storage**: The browser's `localStorage` Web Storage API used for all persistence.
- **Session**: A single continuous Timer run from start to either completion or stop.
- **Greeting**: The time-sensitive salutation displayed at the top of the Dashboard.
- **User**: The person operating the Dashboard in a browser.

---

## Requirements

### Requirement 1: Live Clock and Date Display

**User Story:** As a User, I want to see the current time and date on the Dashboard, so that I can
stay oriented without switching tabs or checking my device clock.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current local time in HH:MM:SS format, where the 12-hour or 24-hour convention matches the browser's locale default.
2. THE Dashboard SHALL display the current local date as a formatted string containing the full weekday name, numeric day, full month name, and four-digit year (e.g., "Thursday, 14 August 2026"), using the browser's locale for ordering and language.
3. WHEN the Dashboard is open, THE Dashboard SHALL update the displayed time every 1000 milliseconds (±50 ms) without requiring a page reload, so that the seconds field increments visibly each second.
4. IF the browser tab becomes visible after being hidden, THEN THE Dashboard SHALL update the displayed time to the current local time within one rendering frame (16 ms after the visibility change event fires).
5. IF the browser cannot determine the local timezone, THEN THE Dashboard SHALL display the time and date in UTC and indicate the UTC offset as "+00:00" adjacent to the time value.

---

### Requirement 2: Time-Based Greeting

**User Story:** As a User, I want to see a greeting that reflects the time of day, so that the
Dashboard feels personal and contextually aware.

#### Acceptance Criteria

1. WHEN the local hour is between 05:00 and 11:59 inclusive, THE Dashboard SHALL display the greeting "Good morning".
2. WHEN the local hour is between 12:00 and 17:59 inclusive, THE Dashboard SHALL display the greeting "Good afternoon".
3. WHEN the local hour is between 18:00 and 04:59 (next day) inclusive, THE Dashboard SHALL display the greeting "Good evening".
4. WHEN the local time crosses a greeting-period boundary, THE Dashboard SHALL update the greeting text within one second.
5. WHEN the Dashboard page loads, THE Dashboard SHALL immediately display the greeting corresponding to the current local hour without waiting for the next clock tick.
6. IF the browser cannot determine the local time, THEN THE Dashboard SHALL display a neutral fallback greeting of "Hello" and not display any time-period-specific text.

---

### Requirement 3: Pomodoro Focus Timer — Configuration

**User Story:** As a User, I want a 25-minute countdown timer, so that I can time focused work
sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE Timer SHALL default to a duration of 25 minutes (1500 seconds) at application load.
2. THE Timer SHALL display the remaining time in MM:SS format at all times.
3. WHILE the Timer is in the idle (not-started) state, THE Dashboard SHALL display a Start button, a Stop button (disabled), and a Reset button (disabled).
4. IF the User sets a custom session duration outside the range of 1 minute (60 seconds) to 60 minutes (3600 seconds), THEN the Timer SHALL reject the input and display an error message indicating the valid range, preserving the previous duration value.
5. WHEN the User sets a custom session duration within the range of 1 minute (60 seconds) to 60 minutes (3600 seconds), THE Timer SHALL update the default duration to the new value and reset the displayed remaining time to match.

---

### Requirement 4: Pomodoro Focus Timer — Controls

**User Story:** As a User, I want Start, Stop, and Reset controls for the timer, so that I can
manage my focus sessions without reloading the page.

#### Acceptance Criteria

1. WHEN the User activates the Start button, THE Timer SHALL begin counting down from the current remaining time at a rate of one second per second.
2. WHILE a Session is active, WHEN the User activates the Stop button, THE Timer SHALL pause the countdown and retain the remaining time.
3. WHEN the User activates the Reset button, THE Timer SHALL stop any running countdown and restore the remaining time to 25 minutes (1500 seconds).
4. WHILE the Timer is running, THE Dashboard SHALL disable the Start button and enable the Stop and Reset buttons.
5. WHILE the Timer is paused or idle, THE Dashboard SHALL enable the Start button, disable the Stop button, and enable the Reset button.
6. WHEN the Timer countdown reaches 00:00, IF the browser has granted notification permission, THEN THE Dashboard SHALL stop the countdown and notify the User with a browser notification or an audible beep.
7. IF the browser does not grant notification permission, THEN THE Dashboard SHALL display a visible on-screen alert indicating the Session has ended, which remains visible for at least 5 seconds or until dismissed by the User.
8. IF the User activates the Start button when the Timer is at 00:00 (expired state), THEN THE Timer SHALL first reset to the default duration before beginning a new countdown.

---

### Requirement 5: Task Creation

**User Story:** As a User, I want to add new tasks to the Dashboard, so that I can track what I
need to accomplish.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a text input field with a maximum capacity of 500 characters and an Add button for creating Tasks.
2. WHEN the User submits a non-empty, non-whitespace-only text value of 1 to 500 characters via the Add button or by pressing the Enter key in the input field, THE Task_List SHALL append a new Task containing that text in the pending state.
3. IF the User attempts to submit an empty or whitespace-only text value, THEN THE Dashboard SHALL not create a Task, SHALL retain focus on the input field, and SHALL display an inline error message indicating that the task text cannot be empty.
4. IF the User attempts to submit a text value exceeding 500 characters, THEN THE Dashboard SHALL not create a Task, SHALL retain focus on the input field, and SHALL display an inline error message indicating that the task text exceeds the maximum allowed length.
5. WHEN a Task is created, THE Dashboard SHALL persist the updated Task_List to Local_Storage immediately before clearing the input field.
6. WHEN a Task is created, THE Dashboard SHALL clear the text input field and return focus to it.
7. IF the Local_Storage write operation fails during Task creation, THEN THE Dashboard SHALL not append the Task to the Task_List and SHALL display an error message indicating that the Task could not be saved.

---

### Requirement 6: Task Display

**User Story:** As a User, I want to see all my tasks listed on the Dashboard, so that I can review
what is pending and what is done.

#### Acceptance Criteria

1. WHEN the Dashboard page loads, THE Dashboard SHALL read all Tasks from Local_Storage and render them in ascending order of their creation timestamp, with the earliest-created Task appearing first.
2. THE Dashboard SHALL visually distinguish completed Tasks from pending Tasks by applying strikethrough text decoration and an opacity of 0.5 to completed Tasks.
3. THE Dashboard SHALL display each Task with its task text (up to 500 characters), a completion toggle control, an edit control, and a delete control.
4. IF Local_Storage is unavailable or returns a read error on page load, THEN THE Dashboard SHALL display an error message indicating that Tasks could not be loaded and render an empty Task list.
5. WHEN Local_Storage contains no Tasks, THE Dashboard SHALL display an empty state message indicating that no Tasks have been created yet.

---

### Requirement 7: Task Completion Toggle

**User Story:** As a User, I want to mark tasks as done or undo that action, so that I can track
my progress.

#### Acceptance Criteria

1. WHEN the User activates the completion toggle on a pending Task, THE Task_List SHALL mark that Task as completed and visually distinguish it from pending Tasks.
2. WHEN the User activates the completion toggle on a completed Task, THE Task_List SHALL mark that Task as pending and remove its completed visual distinction.
3. WHEN a Task's completion state changes, THE Dashboard SHALL persist the entire updated Task_List to Local_Storage within 300 milliseconds.
4. IF Local_Storage is unavailable when persisting a Task's completion state change, THEN THE Dashboard SHALL display an error message indicating the save failed and revert the Task to its previous completion state.

---

### Requirement 8: Task Editing

**User Story:** As a User, I want to edit the text of an existing task, so that I can correct
mistakes or update task descriptions without deleting and re-adding.

#### Acceptance Criteria

1. WHEN the User activates the edit control on a Task, THE Dashboard SHALL replace the Task's text with an inline editable text field pre-filled with the current Task text, with the cursor positioned at the end of the text.
2. WHILE a Task is in edit mode, THE Dashboard SHALL display a Save (confirm) control and a Cancel control, and SHALL hide the edit and delete controls for that Task.
3. WHEN the User submits a non-empty edited text value of 1 to 500 characters (leading/trailing whitespace trimmed) via the Save control or by pressing the Enter key, THE Task_List SHALL update the Task text to the trimmed value.
4. WHEN the User activates the Cancel control or presses the Escape key, THE Dashboard SHALL discard any changes and restore the Task to its previous display state.
5. IF the User attempts to save an empty or whitespace-only text value, THEN THE Dashboard SHALL not update the Task, SHALL retain the edit field in focus, and SHALL display an inline error message indicating that the task text cannot be empty.
6. WHEN a Task text is saved, THE Dashboard SHALL persist the updated Task_List to Local_Storage within 100 milliseconds.
7. IF the Local_Storage write operation fails when saving a Task edit, THEN THE Dashboard SHALL display an error message indicating the save failed and SHALL preserve the Task's previous text in the current session.

---

### Requirement 9: Task Deletion

**User Story:** As a User, I want to delete tasks I no longer need, so that the Task_List stays
relevant and uncluttered.

#### Acceptance Criteria

1. WHEN the User activates the delete control on a Task, THE Dashboard SHALL display a confirmation prompt before deletion is executed.
2. IF the User confirms the deletion prompt, THEN THE Task_List SHALL permanently remove that Task from the list.
3. IF the User cancels the confirmation prompt, THEN THE Dashboard SHALL leave the Task unchanged and dismiss the prompt.
4. WHEN a Task is deleted, THE Dashboard SHALL persist the updated Task_List to Local_Storage immediately.
5. WHEN a Task is deleted, THE Dashboard SHALL update the rendered Task_List without requiring a page reload.

---

### Requirement 10: Task Persistence Across Sessions

**User Story:** As a User, I want my tasks to survive page reloads and browser restarts, so that I
never lose my list by accident.

#### Acceptance Criteria

1. WHEN the Dashboard page loads, THE Dashboard SHALL read the Task_List from Local_Storage and render all persisted Tasks in the same order they were saved.
2. IF Local_Storage contains no Task_List data, THEN THE Dashboard SHALL render an empty Task_List with zero Task items displayed.
3. THE Task_List SHALL be serialized as a JSON array in Local_Storage under a fixed, documented key, and THE Dashboard SHALL write the updated Task_List to Local_Storage within 1 second after any Task is added, edited, deleted, or reordered.
4. IF Local_Storage data for the Task_List key exists but cannot be parsed as a valid JSON array, THEN THE Dashboard SHALL discard the corrupted data, initialize an empty Task_List, and display an error message indicating that saved tasks could not be loaded.
5. IF a Local_Storage write operation fails, THEN THE Dashboard SHALL display an error message indicating that the Task_List could not be saved, and THE Task_List SHALL remain unchanged in the current session.

---

### Requirement 11: Quick Links — Creation

**User Story:** As a User, I want to add shortcut buttons for my favourite websites, so that I can
navigate to them in one click from the Dashboard.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an interface for the User to add a new Link by entering a label (1–50 characters) and a URL (1–2048 characters).
2. WHEN the User submits a non-empty label and a non-empty URL, THE Quick_Links panel SHALL append a new Link button displaying the submitted label, up to a maximum collection size of 50 Links.
3. IF the User attempts to submit with an empty label or an empty URL, THEN THE Dashboard SHALL not create a Link and SHALL display an inline validation message adjacent to each empty field indicating which field is missing.
4. IF the User attempts to submit a label exceeding 50 characters or a URL exceeding 2048 characters, THEN THE Dashboard SHALL not create a Link and SHALL display an inline validation message indicating which field exceeds its maximum length.
5. WHEN a Link is created, THE Dashboard SHALL persist the updated Links collection to Local_Storage before the UI resets the input fields.
6. THE Dashboard SHALL accept URLs that include the scheme (e.g., "https://") and SHALL prepend "https://" to any submitted URL that does not begin with a recognised scheme ("http://" or "https://").

---

### Requirement 12: Quick Links — Navigation

**User Story:** As a User, I want to open a saved link in a new browser tab, so that the Dashboard
remains open while I visit the linked site.

#### Acceptance Criteria

1. WHEN the User activates a Link button in the Quick_Links panel, THE Dashboard SHALL open the associated URL in a new browser tab.
2. WHEN the User activates a Link button in the Quick_Links panel, THE Dashboard SHALL pass the URL to the browser without modification after scheme normalisation (Requirement 11, criterion 6).
3. IF the associated URL cannot be opened in a new browser tab (e.g., the browser blocks the action), THEN THE Dashboard SHALL display an error message indicating that the link could not be opened.

---

### Requirement 13: Quick Links — Deletion

**User Story:** As a User, I want to remove Quick Links I no longer need, so that the panel stays
clean and relevant.

#### Acceptance Criteria

1. THE Dashboard SHALL display a delete control on each Link button that is visible on hover or focus of that Link button.
2. WHEN the User activates the delete control on a Link, THE Dashboard SHALL require a confirmation action before permanently removing that Link.
3. IF the User confirms the deletion, THEN THE Quick_Links panel SHALL permanently remove that Link from the displayed Links collection.
4. WHEN a Link is deleted, THE Dashboard SHALL persist the updated Links collection to Local_Storage immediately.
5. IF the Links collection is empty after deletion, THEN THE Quick_Links panel SHALL display a placeholder message indicating no links have been added.

---

### Requirement 14: Quick Links — Persistence Across Sessions

**User Story:** As a User, I want my Quick Links to survive page reloads, so that I do not have to
re-enter them every time.

#### Acceptance Criteria

1. WHEN the Dashboard page loads, THE Dashboard SHALL read the Links collection from Local_Storage and render all persisted Link buttons in the Quick_Links panel.
2. IF Local_Storage contains no Links data, THEN THE Dashboard SHALL render the Quick_Links panel with no Link buttons and an empty state message indicating no links have been saved.
3. IF Local_Storage contains a Links entry that is not valid JSON or does not conform to the expected array structure, THEN THE Dashboard SHALL discard the corrupt entry, clear that Local_Storage key, and render the Quick_Links panel as empty.
4. WHEN the Links collection changes (Link added or deleted), THE Dashboard SHALL write the updated Links collection to Local_Storage within 500 milliseconds of the change.
5. THE Links collection SHALL be serialized as a JSON array in Local_Storage under a fixed key named "quickLinks", where each element contains at minimum the Link label (1–100 characters) and URL (1–2048 characters).

---

### Requirement 15: Project File Structure

**User Story:** As a developer, I want the project to follow a clean, predictable file structure,
so that the codebase is easy to maintain and extend.

#### Acceptance Criteria

1. THE Dashboard SHALL be delivered as exactly one HTML file at the project root (e.g., `index.html`).
2. THE Dashboard SHALL reference exactly one CSS file located inside a `css/` directory.
3. THE Dashboard SHALL reference exactly one JavaScript file located inside a `js/` directory.
4. THE Dashboard SHALL not require any build tools, package managers, or external frameworks to run.
5. THE Dashboard SHALL function correctly when opened directly in a browser via the `file://` protocol or served from a local HTTP server.
6. IF the browser cannot load the CSS or JS file (e.g., due to a missing or unreachable path), THEN THE Dashboard SHALL remain structurally intact and all text content SHALL be readable, even if unstyled or non-interactive.

---

### Requirement 16: Browser Compatibility

**User Story:** As a User, I want the Dashboard to work in any modern browser, so that I am not
restricted to a specific browser.

#### Acceptance Criteria

1. THE Dashboard SHALL render and function correctly in the latest stable release of Chrome, Firefox, Edge, and Safari at the time of implementation.
2. THE Dashboard SHALL use only Web APIs available in all four browsers listed in criterion 1 without polyfills.
3. THE Dashboard SHALL be responsive and usable on viewport widths from 320 px to 2560 px.
4. IF the Dashboard is opened in a browser that does not support a required Web API, THEN THE Dashboard SHALL display a warning message indicating the browser is unsupported and listing the minimum supported browser versions.
5. THE Dashboard SHALL not produce horizontal scrollbar, content overflow, or overlapping elements at any viewport width between 320 px and 2560 px.

---

### Requirement 17: Performance

**User Story:** As a User, I want the Dashboard to load and respond instantly, so that it does not
slow down my workflow.

#### Acceptance Criteria

1. THE Dashboard SHALL complete initial render, measured from navigation start to the point at which all tasks and controls are visible and interactive, in under 2 seconds on a device with a minimum of a 2 GHz dual-core CPU, 4 GB RAM, and a current-version desktop browser with no network throttling applied.
2. WHEN the User interacts with any control (add task, toggle, delete, timer button), THE Dashboard SHALL reflect the updated state within 100 milliseconds.
3. THE Dashboard SHALL not block the browser's main thread for more than 50 milliseconds during any single Local_Storage read or write operation involving a data payload of up to 5 MB.
4. WHEN the User navigates back to the Dashboard after a previous load within the same browser session, THE Dashboard SHALL complete re-render to a fully interactive state within 500 milliseconds on the same device specification defined in criterion 1.

---

### Requirement 18: Visual Hierarchy and Readability

**User Story:** As a User, I want a clean and readable interface, so that I can use the Dashboard
without any learning curve or visual confusion.

#### Acceptance Criteria

1. THE Dashboard SHALL use a minimum body font size of 14 px and a minimum line height of 1.4.
2. THE Dashboard SHALL maintain a colour contrast ratio of at least 4.5:1 between text and its background, and at least 3:1 between non-text UI elements (icons, input borders, and interactive controls) and their adjacent background, in accordance with WCAG 2.1 Level AA.
3. THE Dashboard SHALL group related controls (clock, timer, task list, quick links) into visually distinct sections, where each section is separated from adjacent sections by a visible boundary (border, background colour change, or whitespace gap of at least 16 px) and is identified by a heading or label.
4. THE Dashboard SHALL maintain uniform spacing between sections such that no section boundary overlaps another at any viewport width between 320 px and 2560 px, with the margin between any two adjacent sections being no less than 8 px.
