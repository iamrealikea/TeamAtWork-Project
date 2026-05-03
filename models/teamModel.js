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

// create
exports.createTeam = async (title, userId) => {
  const team = await db.query(
    `INSERT INTO teams (title, owner_id)
     VALUES ($1, $2) RETURNING *`,
    [title, userId]
  )

  // add owner เป็น member ด้วย
  await db.query(
    `INSERT INTO team_members (user_id, team_id)
     VALUES ($1, $2)`,
    [userId, team.rows[0].id]
  )

  return team.rows[0]
}

// update
exports.updateTeam = async (teamId, title, userId) => {
  const result = await db.query(`
    UPDATE teams
    SET title = $1
    WHERE id = $2 AND owner_id = $3
    RETURNING *
  `, [title, teamId, userId])

  return result.rows[0]
}

// delete
exports.deleteTeam = async (teamId, userId) => {
  await db.query(
    `DELETE FROM teams WHERE id = $1 AND owner_id = $2`,
    [teamId, userId]
  )
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