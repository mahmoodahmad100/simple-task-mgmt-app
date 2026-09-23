const fs = require('node:fs/promises');
const path = require('node:path');

const queues = new Map();

function enqueue(filePath, task) {
  const previous = queues.get(filePath) || Promise.resolve();
  const run = previous.then(task, task);

  queues.set(
    filePath,
    run.then(
      () => undefined,
      () => undefined
    )
  );

  return run;
}

async function readJsonArrayUnlocked(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    if (!raw.trim()) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`Expected a JSON array in ${filePath}.`);
    }

    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, '[]\n', 'utf-8');
      return [];
    }

    throw error;
  }
}

async function writeJsonArrayUnlocked(filePath, data) {
  if (!Array.isArray(data)) {
    throw new Error('JSON store expected an array.');
  }

  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
  );

  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function readJsonArray(filePath) {
  return enqueue(filePath, () => readJsonArrayUnlocked(filePath));
}

async function writeJsonArray(filePath, data) {
  return enqueue(filePath, () => writeJsonArrayUnlocked(filePath, data));
}

async function updateJsonArray(filePath, mutator) {
  return enqueue(filePath, async () => {
    const current = await readJsonArrayUnlocked(filePath);
    const next = await mutator(current);

    if (!Array.isArray(next)) {
      throw new Error('JSON store expected an array.');
    }

    await writeJsonArrayUnlocked(filePath, next);
    return next;
  });
}

module.exports = {
  readJsonArray,
  writeJsonArray,
  updateJsonArray,
};
