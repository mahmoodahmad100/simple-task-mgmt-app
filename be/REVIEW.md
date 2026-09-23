# Backend review

Review of the Tasks API and Activity Log API as they stand today. Data lives in `data/tasks.json` and `data/activity.json`.

## Strengths

- Tasks are already split into routes, a controller, and a service. That layout is easy to follow and is the right place for a reports module later.
- `HttpError` and `errorHandler` keep unexpected failures as a generic 500 and only attach `details` for known client errors.
- `asyncHandler` forwards rejected promises into that error handler for the task routes.
- `jsonStore` is a small async helper for reading and writing a JSON array, and the tasks module already uses it.
- `taskValidator` already checks body shape, unknown fields, title, and `completed`. Nothing calls it yet.

## Bugs

### Task updates copy the whole request body onto the record

**What is wrong.** `updateTask` builds the saved task with `{ ...existingTask, ...updates }`. The controller forwards `req.body` after a few checks, and it does not strip fields outside `title` and `completed`.

**Why it is a problem.** A client can overwrite `id` or `createdAt`, or store arbitrary keys on the task. Later reads then return a record that no longer matches the task shape.

**How to improve it.** Accept only `title` and `completed` when writing the record. Reject any other field with 400 before the file is touched.

### Create and update do not share one validation path

**What is wrong.** `tasks.controller.js` and `tasks.service.js` both validate the same body, with different messages. Create allows any non-empty trimmed title. Update rejects a title shorter than 2 characters. `taskValidator.js` implements a third set of checks and is never imported.

**Why it is a problem.** A title that creates successfully can fail on the next patch, and the error text depends on which layer runs first. Fixing a rule in one file leaves the other two stale.

**How to improve it.** Call `validateCreateTask` and `validateUpdateTask` from the controller and delete the copies. Keep the current title rule there: create requires a non-empty trimmed title; update rejects a trimmed title shorter than 2 characters.

### Creating a task mutates the request body

**What is wrong.** `createTask` in the controller assigns `payload.completed = false` on `req.body`, and the service does the same when `completed` is missing.

**Why it is a problem.** Handlers should not change the object Express parsed. A later middleware, logger, or retry would see a body the client did not send.

**How to improve it.** Build a new object in the validator and pass that into the service. Leave `req.body` alone.

### Activity errors bypass the shared error handler

**What is wrong.** Activity routes call synchronous `fs` helpers and are not wrapped in `asyncHandler`. `loadData` uses `JSON.parse` with no guard. A corrupt `activity.json` throws a `SyntaxError` that does not use `HttpError`.

**Why it is a problem.** Task failures return `{ error: { message } }`. A bad activity file can surface a different failure mode, and the process work happens on the blocking path described below.

**How to improve it.** Read and write activity through `jsonStore`, throw `HttpError` for bad input, and wrap the routes with `asyncHandler`.

### Activity ids can collide

**What is wrong.** New activity ids are `String(Date.now())`.

**Why it is a problem.** Two creates in the same millisecond get the same id. There is no lookup-by-id today, but the field is the only identity on the record.

**How to improve it.** Use `createId`, which the tasks module already uses.

### A non-array JSON file is treated as an empty list

**What is wrong.** `readJsonArray` returns `[]` when the file parses to something that is not an array.

**Why it is a problem.** The next create or update writes that empty list back and deletes the previous contents.

**How to improve it.** Throw when the parsed value is not an array. Only return `[]` for a missing or empty file.

### JSON writes are not atomic

**What is wrong.** `writeJsonArray` writes straight to the target path with `fs.writeFile`.

**Why it is a problem.** A crash or overlapping write can leave a truncated file. The next read then throws, or, with the current non-array handling, can wipe the data.

**How to improve it.** Write a temporary file in the same directory and rename it over the target.

### The server listens on the wrong default port

**What is wrong.** `server.js` uses `process.env.PORT || 3000`. The frontend calls `http://localhost:4000`.

**Why it is a problem.** A local start with no `PORT` set is unreachable from the app that already talks to this API.

**How to improve it.** Default `PORT` to `4000`.

## Performance

### Activity reads and writes block the event loop

**What is wrong.** `activity.service.js` uses `fs.readFileSync` and `fs.writeFileSync`. `loadDataA` and `loadDataB` do the same work twice in the file.

**Why it is a problem.** A slow disk stalls every other request on the process, including task routes that are otherwise async.

**How to improve it.** Use the async `jsonStore` helpers and delete the duplicate loader.

### Overlapping updates can drop writes

**What is wrong.** Every mutation reads the whole file, changes the array in memory, and writes it back. Nothing queues those steps per file.

**Why it is a problem.** Two requests can read the same array, and the write that finishes last erases the other change. That shows up as a lost task or a lost activity entry.

**How to improve it.** Run read-modify-write for each file path one at a time inside `jsonStore`.

## Maintainability

### The two modules do not share infrastructure

**What is wrong.** Tasks use `jsonStore`, `HttpError`, and `asyncHandler`. Activity opens `data/activity.json` itself, returns raw throws, and registers plain route handlers.

**Why it is a problem.** A fix to file handling or error shape has to be repeated, and it is easy to update only one module.

**How to improve it.** Move activity onto the same store, error type, and route wrapper. Keep its response body as a raw array or object so existing clients stay valid.

### Activity names do not match the rest of the code

**What is wrong.** The activity module uses `get_activity`, `aSvc`, `fp`, `loadDataA`, and `loadDataB`.

**Why it is a problem.** The tasks module uses `listTasks`, `tasksService`, and `TASKS_FILE_PATH`. The activity names hide what the functions return and make the duplicate loaders look intentional.

**How to improve it.** Rename them to the same style as tasks: `listActivity`, `activityService`, and `ACTIVITY_FILE_PATH`.

## Security

### Mass assignment on task update

**What is wrong.** This is the same spread described under Bugs. Any JSON key in the patch body is stored.

**Why it is a problem.** Clients can change identity fields and attach data the API never documented.

**How to improve it.** Persist only `title` and `completed`, and reject unknown keys in the validator that already lists `ALLOWED_FIELDS`.

### Activity input is stored without a type check

**What is wrong.** `POST /activity` copies `action` and `info` from the body with no check. A non-object body becomes `{}` only because of `req.body || {}`.

**Why it is a problem.** Numbers, objects, or arrays land in the log. Readers that expect strings then break, and a large nested value is written to disk.

**How to improve it.** Require a JSON object. If `action` or `info` is present, require a string. Still allow an entry when both are omitted.

### JSON body size is unlimited in practice

**What is wrong.** `express.json()` is mounted with no `limit`.

**Why it is a problem.** The default is large enough for these payloads, but an explicit cap makes the limit obvious and rejects oversized bodies before they are written to the JSON files.

**How to improve it.** Set a small limit, such as `100kb`, on `express.json()`.

## Code quality

### The same checks and loaders exist more than once

**What is wrong.** Title and `completed` checks are written in the controller, again in the service, and again in `taskValidator`. Activity file loading is copied as `loadDataA` and `loadDataB`.

**Why it is a problem.** The copies drift. They already disagree on title length and on error messages.

**How to improve it.** One validator for tasks, one loader in `jsonStore`, and services that only read and write records.

### Client errors are returned in two styles

**What is wrong.** Task controllers often `return res.status(400).json(...)`. The service throws `HttpError` for the same class of mistake. Activity does neither in a consistent way.

**Why it is a problem.** Status text and the `{ error: { message } }` shape depend on which function noticed the problem. New endpoints will copy whichever pattern is nearest.

**How to improve it.** Throw `HttpError` for every 400 and 404, and let `errorHandler` send the response.
