const activityService = require('../services/activity.service');

async function listActivity(req, res) {
  const activity = await activityService.getAllActivity();
  res.status(200).json(activity);
}

async function addActivity(req, res) {
  const entry = await activityService.createActivity(req.body);
  res.status(201).json(entry);
}

module.exports = {
  listActivity,
  addActivity,
};
