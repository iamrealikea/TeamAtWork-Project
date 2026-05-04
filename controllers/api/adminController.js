const User = require('../../models/userModel');
const Team = require('../../models/teamModel');

// GET /users
exports.getAllUsers = async (req, res) => {
  const users = await User.getAll();
  res.json(users);
}

// GET /teams
exports.getAllTeams = async (req, res) => {
  const teams = await Team.getAllTeams();
  res.json(teams);
}

exports.getActiveSessions = async (req, res) => {
  const sessions = await User.getActiveSession();
  res.json(sessions);
}