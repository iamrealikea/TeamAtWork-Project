const db = require('../config/db');

//Upload file for assignment
exports.uploadFile = async (assignId, userId, fileHash, fileExt, teamId, originalName) => {
    const result = await db.query(
        `INSERT INTO assignment_files (assignment_id, user_id, file_id, file_ext, team_id, file_original)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING file_id
         `,
        [assignId, userId, fileHash, fileExt, teamId, originalName]
    )
    return result.rows[0].file_id;
}

exports.deleteFile = async (fileId, userId) => {
    const result = await db.query(
        `DELETE FROM assignment_files WHERE file_id = $1 AND user_id = $2`,
        [fileId, userId]
    );
    return result.rows;
}

exports.getFilesByAssignmentId = async (assignId, userId) => {
    const result = await db.query(
        `SELECT file_id, file_ext, file_original, user_id FROM assignment_files WHERE assignment_id = $1 AND user_id = $2`,
        [assignId, userId]
    );
    return result.rows;
}

exports.getFilesByAssignmentIdWithManager = async (assignId, userId, teamId) => {
    const result = await db.query(
        `SELECT file_id, file_ext, file_original, user_id
         FROM assignment_files
         WHERE assignment_id = $1
           AND (
               user_id = $2
               OR user_id IN (
                   SELECT user_id FROM team_members WHERE team_id = $3 AND role = 'Manager'
               )
           )
         ORDER BY created_at DESC`,
        [assignId, userId, teamId]
    );
    return result.rows;
}

exports.getFileByOriginalName = async (originalName, assignId, userId) => {
    const result = await db.query(
        `SELECT file_id, file_ext, file_original, created_at FROM assignment_files 
        WHERE file_original = $1 AND assignment_id = $2 AND user_id = $3`,
        [originalName, assignId, userId]
    );
    return result.rows[0];
}

//For admin to get all files in assignment
exports.getAllFilesByAssignmentId = async (assignId) => {
    const result = await db.query(
        `SELECT af.file_id, af.file_ext, af.file_original, af.user_id, af.created_at,
            u.firstname, u.lastname, u.avatar_hash, u.avatar_ext,
            ua.status, ua.submitted_at
        FROM assignment_files af
        JOIN users u ON af.user_id = u.id
        LEFT JOIN user_assignments ua ON ua.user_id = af.user_id AND ua.assignment_id = af.assignment_id
        WHERE af.assignment_id = $1
        ORDER BY u.firstname ASC, u.lastname ASC, af.created_at DESC`,
        [assignId]
    );
    return result.rows;
}