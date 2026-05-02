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
  const { title } = req.body
  const userId = req.session.user.id

  if (!title) return res.status(400).json({ error: 'Title required' })

  const team = await Team.createTeam(title, userId)
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
  const { teamId, userId } = req.params

  await Team.removeMember(teamId, userId)
  res.json({ message: 'Member removed' })
}