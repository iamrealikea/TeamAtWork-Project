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

// DELETE self from team
exports.leaveTeam = async (req, res) => {
  const { teamId } = req.params
  const userId = req.session.user.id

  const team = await Team.getTeamById(teamId, userId)
  if (!team) {
    return res.status(403).json({ error: 'You are not a member of this team' })
  }

  await Team.removeMember(teamId, userId)
  res.json({ message: 'Left team successfully' })
}

exports.updateMemberRole = async (req, res) => {
  const { teamId, userId } = req.params
  const { role } = req.body

  if (!['Member', 'Manager'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  await Team.updateMemberRole(teamId, userId, role)
  res.json({ message: 'Role updated' })
}

// DELETE member (kick)
exports.kickMember = async (req, res) => {
  const { teamId, userId } = req.params
  const userIdFromToken = req.session.user.id

  try {
    // Get team members to check roles
    const members = await Team.getTeamMembers(teamId)
    const requester = members.find(m => m.id === userIdFromToken)
    const memberToKick = members.find(m => m.id === parseInt(userId))

    if (!requester) {
        if (!req.session.user.isAdmin) {
            return res.status(403).json({ message: 'You are not a member of this team' })
        }
        // Admin global can kick without being a member
    }

    if (!memberToKick) {
        return res.status(404).json({ message: 'Member not found in team' })
    }

    // Cannot kick yourself
    if (userIdFromToken === parseInt(userId)) {
        return res.status(400).json({ message: 'Cannot kick yourself' })
    }

    // Cannot kick admin (but no admin role in teams)
    // If requester is manager, cannot kick other managers
    if (requester && requester.role === 'Manager' && memberToKick.role === 'Manager') {
        return res.status(403).json({ message: 'Managers cannot kick other managers' })
    }

    // Only admin global or team managers can kick
    if (!req.session.user.isAdmin && (!requester || requester.role !== 'Manager')) {
        return res.status(403).json({ message: 'Only admins and managers can kick members' })
    }

    await Team.removeMember(teamId, userId)
    res.json({ message: 'Member kicked successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Admin routes
exports.getAllTeams = async (req, res) => {
  const teams = await Team.getAllTeams()
  res.json(teams)
}