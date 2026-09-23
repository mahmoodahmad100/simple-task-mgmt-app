const path = require('node:path');

const { readJsonArray } = require('../../../utils/jsonStore');

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');
const ACTIVITY_FILE_PATH = path.join(process.cwd(), 'data', 'activity.json');

async function getTasksSummary() {
  const [tasks, activity] = await Promise.all([
    readJsonArray(TASKS_FILE_PATH),
    readJsonArray(ACTIVITY_FILE_PATH),
  ]);

  let todo = 0;
  let done = 0;

  for (const task of tasks) {
    if (task.completed) {
      done += 1;
    } else {
      todo += 1;
    }
  }

  return {
    total: tasks.length,
    byStatus: {
      todo,
      'in-progress': 0,
      done,
    },
    recentActivityCount: activity.length,
  };
}

module.exports = {
  getTasksSummary,
};
