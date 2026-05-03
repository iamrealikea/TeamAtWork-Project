const db = require('../config/db')
const { hashFileName } = require('../utils/hash');

//Post Assignment
exports.postAssignment = async (
    title, description, team_id, created_by, due_date) => {
    const id = nanoid(12);
    const result = await db.query(
        `INSERT INTO assignments (title, description, team_id, created_by, due_date, id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [title, description, team_id, created_by, due_date, id]
    )
    return result.rows;
}

// Check user's all assignment
exports.getUserAssignment = async (id) => {
    const result = await db.query(
        `SELECT a.*, u.firstname AS creator_name
        FROM assignments a
        JOIN users u ON a.created_by = u.id
        JOIN team_members tm ON a.team_id = tm.team_id
        WHERE tm.user_id = $1
        ORDER BY a.created_at DESC`,
        [id]
    )
    return result.rows;
}

//Check assignment in team
exports.getTeamAssignment = async (teamId) => {
    const result = await db.query(
        `SELECT a.*, u.firstname AS creator_name
        FROM assignments a
        JOIN users u ON a.created_by = u.id
        WHERE a.team_id = $1
        ORDER BY a.created_at DESC`,
        [teamId]
    )
    return result.rows;
}

//Check assignment by id
exports.getAssignmentById = async (assignId) => {
    const result = await db.query(
        `SELECT a.*, u.firstname AS creator_name
        FROM assignments a
        JOIN users u ON a.created_by = u.id
        WHERE a.id = $1`,
        [assignId]
    )
    return result.rows[0];
}

exports.claimAssignment = async (assignId, userId) => {
    const result = await db.query(
        `INSERT INTO user_assignments (user_id, assignment_id)
            VALUES ($1, $2)`,
        [userId, assignId]
    )
    return result.rowCount > 0;
}

exports.unclaimAssignment = async (assignId, userId) => {
    const result = await db.query(
        `DELETE FROM user_assignments WHERE user_id = $1 AND assignment_id = $2`,
        [userId, assignId]
    )
    return result.rowCount > 0;
}

