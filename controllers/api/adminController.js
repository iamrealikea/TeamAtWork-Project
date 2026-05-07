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

exports.updateUser = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.updateAccount(userId, req.body);
  if (user === null) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json(user);
}

exports.updateTeam = async (req, res) => {
  const teamId = req.params.teamId;
  const team = await Team.updateTeamAdmin(teamId, req.body);
  if (team === null) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }
  return res.json(team);
}

exports.deleteTeam = async (req, res) => {
  const teamId = req.params.teamId;
  const deleted = await Team.deleteTeamAdmin(teamId);
  if (!deleted) {
    return res.status(404).json({ message: 'Team not found' });
  }
  return res.json({ message: 'Team deleted' });
}