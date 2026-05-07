const db = require('../config/db')

// teams ของ user
exports.getUserTeams = async (userId) => {
  const result = await db.query(`
    SELECT 
            t.*,
            tm.role,
            u.firstname AS creator_name,
            COUNT(tm2.user_id) AS member_count
        FROM teams t
        JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = $1
        JOIN users u ON t.created_by = u.id
        LEFT JOIN team_members tm2 ON t.id = tm2.team_id
        GROUP BY t.id, tm.role, u.firstname
  `, [userId])
  return result.rows
}

exports.getTeamMembers = async (teamId) => {
  const result = await db.query(`
    SELECT 
      u.id,u.firstname, u.lastname, u.avatar_hash, u.avatar_ext, tm.role
    FROM users u
    JOIN team_members tm ON u.id = tm.user_id
    WHERE tm.team_id = $1
  `, [teamId])
  return result.rows
}

// team by id 
exports.getTeamById = async (teamId, userId) => {
  const result = await db.query(`
    SELECT t.*, tm.role
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE t.id = $1 AND tm.user_id = $2
  `, [teamId, userId])
  return result.rows[0]
}

exports.getTeamByIdAdmin = async (teamId) => {
  const result = await db.query(`
    SELECT t.*, u.firstname AS creator_name
    FROM teams t
    JOIN users u ON t.created_by = u.id
    WHERE t.id = $1
  `, [teamId])
  return result.rows[0]
}

exports.removeMember = async (teamId, userId) => {
  const query = 'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2';
  await db.query(query, [teamId, userId]);
}

// create
exports.createTeam = async (name, userId, description) => {
  const team = await db.query(
    `INSERT INTO teams (name, created_by, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, userId, description]
  )

  // add owner เป็น member ด้วย
  await db.query(
    `INSERT INTO team_members (user_id, team_id, role)
     VALUES ($1, $2, 'Manager')`,
    [userId, team.rows[0].id]
  )

  return team.rows[0]
}

// update
exports.updateTeam = async (teamId, name, description, userId) => {
  const result = await db.query(`
    UPDATE teams
    SET name = $1, description = $2
    WHERE id = $3 AND created_by = $4
    RETURNING *
  `, [name, description, teamId, userId])

  return result.rows[0]
}

exports.updateTeamAdmin = async (teamId, updates) => {
  const entries = Object.entries(updates || {}).filter(([key, value]) => (
    ['name', 'description'].includes(key) && value !== undefined
  ))

  if (entries.length === 0) {
    return null
  }

  const setClause = entries
    .map(([key], index) => `${key} = $${index + 1}`)
    .join(', ')
  const values = entries.map(([, value]) => value)
  values.push(teamId)

  const result = await db.query(
    `UPDATE teams SET ${setClause} WHERE id = $${entries.length + 1} RETURNING *`,
    values
  )

  return result.rows[0]
}

// delete
exports.deleteTeam = async (teamId, userId) => {
  await db.query(
    `DELETE FROM teams WHERE id = $1 AND created_by = $2`,
    [teamId, userId]
  )
}

exports.deleteTeamAdmin = async (teamId) => {
  const result = await db.query(
    `DELETE FROM teams WHERE id = $1 RETURNING id`,
    [teamId]
  )
  return result.rows[0]
}

// members
exports.getMembers = async (teamId) => {
  const result = await db.query(`
    SELECT u.id, u.firstname, u.lastname, u.avatar_hash, u.avatar_ext
    FROM users u
    JOIN team_members tm ON u.id = tm.user_id
    WHERE tm.team_id = $1
  `, [teamId])
  return result.rows
}

exports.addMember = async (teamId, userId, role) => {
  await db.query(
    `INSERT INTO team_members (user_id, team_id, role)
     VALUES ($1, $2, $3)`,
    [userId, teamId, role]
  )
}

exports.removeMember = async (teamId, userId) => {
  await db.query(
    `DELETE FROM team_members
     WHERE team_id = $1 AND user_id = $2`,
    [teamId, userId]
  )
}

exports.updateMemberRole = async (teamId, userId, role) => {
  await db.query(
    `UPDATE team_members SET role = $1 WHERE team_id = $2 AND user_id = $3`,
    [role, teamId, userId]
  )
}

// Admin functions
exports.getAllTeams = async () => {
  const result = await db.query(`
    SELECT t.*, u.firstname AS creator_name
    FROM teams t
    JOIN users u ON t.created_by = u.id
  `)
  return result.rows
}