const Assignment = require('../../models/assignmentModel');
const fileHandle = require('../../models/filesModel');
const path = require('path');
const fs = require('fs');
const {FILE_DIR} = require('../../config/multer');

exports.getTeamAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const assignments = await Assignment.getTeamAssignment(teamId)
    return res.json ({ teamId, assignId})
}

exports.postAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const { title, description, due_date } = req.body;
    const result = await Assignment.postAssignment(
        title, description, teamId, sessionUserId, due_date
    )
    return res.json(result)
}

exports.claimAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const action = req.query.action; // 'claim' or 'unclaim'

    if (action === 'claim') {
        await Assignment.claimAssignment(assignId, sessionUserId);
        return res.json({ message: 'Assignment claimed' });
    } else if (action === 'unclaim') {
        await Assignment.unclaimAssignment(assignId, sessionUserId);
        return res.json({ message: 'Assignment unclaimed' });
    } else {
        return res.status(400).json({ error: 'Invalid action' });
    }
    
}

exports.fileUpload = async (req,res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const files = req.files;
    if(!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
    try {
        const uploaded = [];
        for (let i = 0; i < files.length; i += 1) {
            const meta = req.fileUpload?.[i];
            const hash = meta?.hash;
            const ext = meta?.ext;
            const originalName = meta?.originalName;
            if (!hash || !ext || !originalName) {
                return res.status(500).json({ error: 'Missing file metadata during upload' });
            }

            const conflictFile = await fileHandle.getFileByOriginalName(originalName, assignId, sessionUserId);
            if (conflictFile?.file_id) {
                const conflictPath = path.join(FILE_DIR, `${conflictFile.file_id}${conflictFile.file_ext}`);
                if (fs.existsSync(conflictPath)) {
                    fs.unlinkSync(conflictPath);
                }
                await fileHandle.deleteFile(conflictFile.file_id, sessionUserId);
            }

            const fileId = await fileHandle.uploadFile(
                assignId, sessionUserId, hash, ext, teamId, originalName
            );
            uploaded.push({ fileId, hash, ext, originalName });
        }

        return res.json({ message: `${uploaded.length} file(s) uploaded successfully`, uploaded });
    } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ error: 'File upload failed' });
    }
}

//Get files in assignment for user that uploaded.
exports.getFileInUserAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const files = await fileHandle.getFilesByAssignmentId(assignId, sessionUserId);
    return res.json({ teamId, assignId, files })
}

//Get all files submitted in assignment for admin view.
exports.getAllFilesInAssignment = async (req, res) => {
    const assignId = req.params.aId;
    const files = await fileHandle.getAllFilesByAssignmentId(assignId);
    const userFileMap = {};
    files.forEach(file => {
        if (!userFileMap[file.user_id]) {
            userFileMap[file.user_id] = [];
        }
        userFileMap[file.user_id].push(file);   
    });
    return res.json({ assignId, files: userFileMap });
}

//Delete file in assignment for user that uploaded.
exports.deleteFileInUserAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const fileId = req.params.file.split('.')[0];
    const fileExt = req.params.file.split('.')[1];
    try {
        const filePath = path.join(FILE_DIR, `${fileId}.${fileExt}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn(`File not found on server storage`);
            const result = await fileHandle.deleteFile(fileId, sessionUserId);
            return res.status(500).json({ error: 'File not found on server. Cleaned up database entry.'});
        }
        const result = await fileHandle.deleteFile(fileId, sessionUserId);
    } catch (error) {
        console.error('Error deleting file:', error);
        return res.status(500).json({ error: 'Failed to delete file' });
    }
    return res.json({ message: 'File deleted successfully'});
}

//For download request.
exports.downloadFileFromId = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const assignId = req.params.aId;
    const fileId = req.params.file.split('.')[0];
    const fileExt = req.params.file.split('.')[1];

    try {
        const files = await fileHandle.getFilesByAssignmentId(assignId, sessionUserId);
        const record = files.find(
            (file) => String(file.file_id) === String(fileId) && String(file.file_ext) === `.${fileExt}`
        );

        if (!record) {
            return res.status(404).json({ error: 'File not found for this assignment' });
        }

        const filePath = path.join(FILE_DIR, `${record.file_id}${record.file_ext}`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        const downloadName = `${record.file_original}${record.file_ext}`;
        return res.download(filePath, downloadName);
    } catch (error) {
        console.error('Error downloading file:', error);
        return res.status(500).json({ error: 'Failed to download file' });
    }
}