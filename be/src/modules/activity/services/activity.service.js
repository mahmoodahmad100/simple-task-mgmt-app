const path = require('node:path');

const { createId } = require('../../../utils/id');
const { readJsonArray, updateJsonArray } = require('../../../utils/jsonStore');
const HttpError = require('../../../utils/httpError');

const ACTIVITY_FILE_PATH = path.join(process.cwd(), 'data', 'activity.json');

function normalizeActivityPayload(body) {
  const payload = body === undefined || body === null ? {} : body;

  if (typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }

  const fields = {};

  if (Object.hasOwn(payload, 'action')) {
    if (typeof payload.action !== 'string') {
      throw new HttpError(400, '"action" must be a string.');
    }

    fields.action = payload.action;
  }

  if (Object.hasOwn(payload, 'info')) {
    if (typeof payload.info !== 'string') {
      throw new HttpError(400, '"info" must be a string.');
    }

    fields.info = payload.info;
  }

  return fields;
}

async function getAllActivity() {
  return readJsonArray(ACTIVITY_FILE_PATH);
}

async function createActivity(body) {
  const fields = normalizeActivityPayload(body);
  const entry = {
    id: createId(),
    ...fields,
    when: new Date().toISOString(),
  };

  await updateJsonArray(ACTIVITY_FILE_PATH, (activity) => {
    activity.push(entry);
    return activity;
  });

  return entry;
}

module.exports = {
  getAllActivity,
  createActivity,
};
