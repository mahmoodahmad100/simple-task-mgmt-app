# Frontend review

Reviewed the task dashboard and activity feed as they exist before the follow-up changes. The dashboard is already split into a hook and small components, with loading, retry, and filter states. The activity feed is one client page that does extra work on a timer and hides failures. Reports are documented and implemented on the backend, and the frontend does not call them yet.

## Performance

### The activity feed re-renders on a timer

**What is wrong.** `app/activity/page.tsx` starts a `setInterval` every 1400ms that increments `tick`. That value is a dependency of the filter effect, the `forcedList` effect, and the stats `useMemo`. On even ticks the visible list is copied with a new array; on odd ticks every item is shallow-copied.

**Why it matters.** Search results are derived data. Recomputing and cloning them on a timer keeps the page rendering when nothing the user did has changed, and it will get more expensive as the log grows.

**Suggested improvement.** Drop the interval and `forcedList`. Filter once with `useMemo` from the loaded logs and the search query.

### Filtering runs twice per update

**What is wrong.** `applyFilterA` and `applyFilterB` both case-fold `action` and `info` and keep the same matches. The effect runs A, then runs B on A's result, and both functions are recreated on every render.

**Why it matters.** The second pass cannot change the result. Recreating the functions inside the component also makes the data flow harder to follow than a single pure helper.

**Suggested improvement.** Keep one pure predicate and call it from `useMemo`.

## Maintainability

### Activity state is stored three times

**What is wrong.** The page keeps `allActivity`, `shownActivity`, and `forcedList` for one list. `shownActivity` and `forcedList` are only copies of the filtered source.

**Why it matters.** Three pieces of state can drift. The effects that copy between them are the kind of logic that breaks when a new filter or sort is added.

**Suggested improvement.** Store the fetched logs and the query. Derive the visible list during render.

### The activity page is one component

**What is wrong.** Fetching, search, stats, and row markup all live in `app/activity/page.tsx`. Time formatting is also duplicated as `formatTimeA` and `formatTimeB`, which are the same function, and both results are rendered.

**Why it matters.** A change to a row, the search field, or the timestamp has to be made inside the page. The duplicate formatter is easy to "fix" in only one place later.

**Suggested improvement.** Move data loading into a hook and split the search field, list, and row into components. Format each timestamp once.

### Layout is copied as inline styles

**What is wrong.** The dashboard, activity page, and home page repeat padding, stacks, and muted text through `style={{ ... }}` props. The home card grid sets `gridTemplateColumns` inline on an element that also uses the `.stack` class.

**Why it matters.** Spacing and color then live in each component. A layout change has to be repeated, and the home grid depends on a class and a style prop agreeing with each other.

**Suggested improvement.** Use shared class names for panels, lists, muted text, and the card grid. Leave one-off values out of the components.

### Task and activity requests parse errors differently

**What is wrong.** `hooks/useTasks.ts` has its own `requestJson`. On a failed response it throws inside `try` and immediately catches that same error. `lib/backendApi.ts` has a second parser. The activity page uses neither: it calls `response.json()` and does not check `response.ok`.

**Why it matters.** A proxy error body is an object, not an array. The activity page will treat that object as logs. The duplicated parsers also make it likely that one path reports the API message and another path reports a generic fallback.

**Suggested improvement.** Share one helper that reads `{ error: { message } }` and throws that message when the response is not ok. Use it from both hooks and from the server proxy client.

## UX issues

### A failed activity load looks like an empty feed

**What is wrong.** The activity `catch` sets every list to `[]`. There is no loading flag. The search box is shown immediately, and the only numbers are "Total: 0 | Visible: 0" whether the request is in flight, failed, or truly empty.

**Why it matters.** The user cannot tell a slow request from a backend outage from a feed with no rows, and there is no retry control.

**Suggested improvement.** Track loading and error separately. Show a loading state, a retryable error, an empty feed, and a distinct "no matches" state when the search query excludes every row.

### Each activity row prints the time twice

**What is wrong.** Every row renders `formatTimeA(item.when)` and `formatTimeB(item.when)`.

**Why it matters.** The two strings are identical, so the row looks broken rather than informative.

**Suggested improvement.** Show one formatted timestamp.

### A failed task update hides the list

**What is wrong.** `TaskDashboard` renders `TaskList` only when `!loading && !error`. `updateTaskStatus` writes the same `error` string used for the initial load.

**Why it matters.** If a toggle fails, the tasks the user was looking at disappear and are replaced by the error banner. Retry reloads the whole list.

**Suggested improvement.** Keep the loaded list on screen when an update fails. Reserve the full-page error for the initial fetch.

### Home cards and the document title are unfinished

**What is wrong.** `app/page.tsx` cards contain only a heading. `app/layout.tsx` still uses a placeholder document title. There is no navigation except a Back link on each inner page.

**Why it matters.** The home page does not say what each module does, and moving between tasks and activity always goes back through home.

**Suggested improvement.** Give each module a short description, add the reports destination, and put Tasks, Activity, and Reports in a shared shell.

### The search field has no accessible name

**What is wrong.** The activity search box is a placeholder-only `<input>`.

**Why it matters.** A placeholder disappears while typing and is not a reliable name for assistive tech.

**Suggested improvement.** Add a `<label>` or an `aria-label`.

## Code quality

### Activity JSON is not validated

**What is wrong.** The fetch handler types the JSON as `ActivityLog[]` and stores `data || []`. A non-array payload still passes the `||` check.

**Why it matters.** The next `.filter` or `.map` throws, which surfaces as a runtime error instead of the empty or error state.

**Suggested improvement.** Require `response.ok` and `Array.isArray` before storing logs.

### Reports are not connected

**What is wrong.** `docs/backend-endpoints.md` describes `GET /reports/tasks-summary` (`total`, `byStatus.todo`, `byStatus["in-progress"]`, `byStatus.done`, `recentActivityCount`). The backend route exists. The frontend has no proxy, type, or page. `in-progress` is always `0` because tasks only store `completed`.

**Why it matters.** The summary cannot be shown, and a UI that hides `in-progress` would conceal that the count is intentionally zero with the current task model.

**Suggested improvement.** Proxy the endpoint the same way as tasks and activity, and render every status count, including zero.

## React best practices

### Derived activity data is written from effects

**What is wrong.** Filtering and list cloning happen in `useEffect` calls that `setState`. The stats memo also depends on `tick`, so it does not cache anything useful. `everySecondTick` is computed and never rendered.

**Why it matters.** Effects are for synchronizing with something outside the render. Using them to copy state adds extra renders and makes the source of the list unclear. The unused tick value shows the memo is tied to the timer rather than to displayed data.

**Suggested improvement.** Derive `visibleLogs` during render. Keep state for the server result, the query, loading, and error.

### The dashboard's client boundary is in the right place; the activity page's is not

**What is wrong.** Tasks are loaded in `useTasks`, and `app/tasks/page.tsx` only renders the shell. The activity route marks the whole page, including the static Back link, as a client component.

**Why it matters.** The tasks split is easier to reuse and test. The activity page has to be a client component only because the interactive parts were never extracted.

**Suggested improvement.** Leave the page as a shell and move the interactive feed into client components, matching the dashboard.
