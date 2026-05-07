const db = require('../config/db')
const { hashFileName } = require('../utils/hash');
const { nanoid } = require('nanoid');

//Post Assignment
exports.postAssignment = async (
    title, description, team_id, created_by, due_date, genID) => {
    
    const result = await db.query(
        `INSERT INTO assignments (title, description, team_id, created_by, due_date, id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *
         `
         ,
        [title, description, team_id, created_by, due_date, genID]
    )
    return result.rows;
}

exports.updateAssignment = async (
    assignId, title, description, due_date) => {
    const result = await db.query(
        `UPDATE assignments
         SET title = $1, description = $2, due_date = $3
            WHERE id = $4`,
        [title, description, due_date, assignId]
    )
    return result.rows;
}

exports.deleteAssignment = async (assignId, teamId) => {
    const result = await db.query(
        `DELETE FROM assignments WHERE id = $1 AND team_id = $2 RETURNING id`,
        [assignId, teamId]
    )
    return result.rows[0];
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
            VALUES ($1, $2)
            ON CONFLICT (user_id, assignment_id) DO NOTHING
            `,
        [userId, assignId]
    )
    return result.rowCount > 0;
}

exports.managerClaimAssignment = async (assignId, userId) => {
    const result = await db.query(
        `INSERT INTO user_assignments (user_id, assignment_id, status)
         VALUES ($1, $2, 'Creator')
         `,
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

exports.markAssignment = async (assignId, userId, status) => {
    const result = await db.query(
        `UPDATE user_assignments SET status = $1, submitted_at = NOW() 
        WHERE user_id = $2 AND assignment_id = $3`,
        [status, userId, assignId]
    )
    return result.rowCount > 0;
}

exports.checkStatus = async (assignId, userId) => {
    const result = await db.query(
        `SELECT status, submitted_at FROM user_assignments WHERE user_id = $1 AND assignment_id = $2`,
        [userId, assignId]
    )
    return result.rows[0];
}

exports.getClaimedMembers = async (assignId) => {
    const result = await db.query(
        `SELECT u.id, u.firstname, u.lastname, u.avatar_hash, u.avatar_ext, ua.status, ua.submitted_at
        FROM user_assignments ua
        JOIN users u ON ua.user_id = u.id
        WHERE ua.assignment_id = $1
        ORDER BY u.firstname ASC, u.lastname ASC`,
        [assignId]
    )
    return result.rows;
}

exports.getUnclaimedMembers = async (teamId, assignId) => {
    const result = await db.query(
        `SELECT u.id, u.firstname, u.lastname, u.avatar_hash, u.avatar_ext
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        LEFT JOIN user_assignments ua
            ON ua.user_id = u.id AND ua.assignment_id = $2
        WHERE tm.team_id = $1 AND ua.user_id IS NULL
        ORDER BY u.firstname ASC, u.lastname ASC`,
        [teamId, assignId]
    )
    return result.rows;
}
