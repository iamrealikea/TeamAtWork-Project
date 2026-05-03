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
        `SELECT file_id, file_ext, file_original FROM assignment_files WHERE assignment_id = $1 AND user_id = $2`,
        [assignId, userId]
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
        `SELECT file_id, file_ext, file_original, user_id, created_at FROM assignment_files WHERE assignment_id = $1`,
        [assignId]
    );
    return result.rows;
}