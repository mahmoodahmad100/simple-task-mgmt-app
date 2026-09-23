const path = require('node:path');

const { createId } = require('../../../utils/id');
const { readJsonArray, updateJsonArray } = require('../../../utils/jsonStore');
const HttpError = require('../../../utils/httpError');

const TASKS_FILE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

function buildTaskRecord(payload) {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: payload.title,
    completed: payload.completed,
    createdAt: now,
    updatedAt: now,
  };
}

async function getAllTasks() {
  return readJsonArray(TASKS_FILE_PATH);
}

async function getTaskById(taskId) {
  const tasks = await readJsonArray(TASKS_FILE_PATH);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new HttpError(404, 'Task not found.');
  }

  return task;
}

async function createTask(payload) {
  const newTask = buildTaskRecord(payload);

  await updateJsonArray(TASKS_FILE_PATH, (tasks) => {
    tasks.push(newTask);
    return tasks;
  });

  return newTask;
}

async function updateTask(taskId, updates) {
  let updatedTask;

  await updateJsonArray(TASKS_FILE_PATH, (tasks) => {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);

    if (taskIndex === -1) {
      throw new HttpError(404, 'Task not found.');
    }

    const existingTask = tasks[taskIndex];
    updatedTask = {
      id: existingTask.id,
      title: Object.hasOwn(updates, 'title') ? updates.title : existingTask.title,
      completed: Object.hasOwn(updates, 'completed')
        ? updates.completed
        : existingTask.completed,
      createdAt: existingTask.createdAt,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    return tasks;
  });

  return updatedTask;
}

async function deleteTask(taskId) {
  let removedTask;

  await updateJsonArray(TASKS_FILE_PATH, (tasks) => {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);

    if (taskIndex === -1) {
      throw new HttpError(404, 'Task not found.');
    }

    [removedTask] = tasks.splice(taskIndex, 1);
    return tasks;
  });

  return removedTask;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
