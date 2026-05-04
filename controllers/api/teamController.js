const Team = require('../../models/teamModel')

// GET /teams
exports.getUserTeams = async (req, res) => {
  const userId = req.session.user.id
  const teams = await Team.getUserTeams(userId)
  res.json(teams)
}

// GET /teams/:teamId
exports.getTeamById = async (req, res) => {
  const { teamId } = req.params
  const userId = req.session.user.id

  const team = await Team.getTeamById(teamId, userId)

  if (!team) return res.status(403).json({ error: 'No access' })
  res.json(team)
}

// POST /teams
exports.createTeam = async (req, res) => {
  const { name, description } = req.body
  const userId = req.session.user.id

  if (!name) return res.status(400).json({ error: 'Name required' })

  const team = await Team.createTeam(name, userId, description)
  res.status(201).json(team)
}

// PATCH /teams/:teamId
exports.updateTeam = async (req, res) => {
  const { teamId } = req.params
  const { title } = req.body
  const userId = req.session.user.id

  const updated = await Team.updateTeam(teamId, title, userId)

  if (!updated) return res.status(403).json({ error: 'No access' })
  res.json(updated)
}

// DELETE
exports.deleteTeam = async (req, res) => {
  const { teamId } = req.params
  const userId = req.session.user.id

  await Team.deleteTeam(teamId, userId)
  res.json({ message: 'Deleted' })
}

//// MEMBERS //////

// GET members
exports.getMembers = async (req, res) => {
  const { teamId } = req.params
  const members = await Team.getMembers(teamId)
  res.json(members)
}

// POST member
exports.addMember = async (req, res) => {
  const { teamId } = req.params
  const { userId, role } = req.body

  await Team.addMember(teamId, userId, role)
  res.status(201).json({ message: 'Member added' })
}

// DELETE member
exports.removeMember = async (req, res) => {
  const { teamId } = req.params
  const { userId } = req.body

  await Team.removeMember(teamId, userId)
  res.json({ message: 'Member removed' })
}

// Admin routes
exports.getAllTeams = async (req, res) => {
  const teams = await Team.getAllTeams()
  res.json(teams)
}