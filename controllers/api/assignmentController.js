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

exports.getClaimedMembers = async (req, res) => {
    const assignId = req.params.aId;
    const members = await Assignment.getClaimedMembers(assignId);
    return res.status(200).json({ assignId, members });
}

exports.getUnclaimedMembers = async (req, res) => {
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    try {
        const members = await Assignment.getUnclaimedMembers(teamId, assignId);
        return res.status(200).json({ assignId, members });
    } catch (error) {
        console.error('Error loading unclaimed members:', error);
        return res.status(500).json({ error: 'Unable to load members' });
    }
}

exports.addMemberToAssignment = async (req, res) => {
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User id required' });
    }

    try {
        const added = await Assignment.claimAssignment(assignId, userId);
        if (!added) {
            return res.status(409).json({ error: 'Member already assigned or not in team' });
        }
        return res.status(201).json({ message: 'Member added' });
    } catch (error) {
        console.error('Error adding member:', error);
        return res.status(500).json({ error: 'Unable to add member' });
    }
}

exports.removeMemberFromAssignment = async (req, res) => {
    const assignId = req.params.aId;
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'User id required' });
    }

    try {
        const removed = await Assignment.unclaimAssignment(assignId, userId);
        if (!removed) {
            return res.status(404).json({ error: 'Member not assigned' });
        }
        return res.status(200).json({ message: 'Member unassigned' });
    } catch (error) {
        console.error('Error removing member:', error);
        return res.status(500).json({ error: 'Unable to unassign member' });
    }
}

//Manager can edit assignment details.
exports.postAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const { title, description, due_date } = req.body;
    const result = await Assignment.postAssignment(
        title, description, teamId, sessionUserId, due_date
    )
    return res.json(result)
}

exports.patchAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const { title, description, due_date } = req.body;
    try {
        const result = await Assignment.updateAssignment(
        assignId, title, description, due_date)
        if (!result){
            return res.status(404).json({ error: 'Assignment not found' });
        }
    } catch (error) {
        console.error('Error updating assignment:', error);
        return res.status(500).json({ error: 'Failed to update assignment' });
    }
    return res.json({ message: 'Assignment updated successfully' });
}

exports.deleteAssignment = async (req, res) => {
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    const deleted = await Assignment.deleteAssignment(assignId, teamId);
    if (!deleted) {
        return res.status(404).json({ error: 'Assignment not found' });
    }
    return res.json({ message: 'Assignment deleted successfully' });
}

//For users to view and manage their files in assignment.
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
    console.log('Received files:', files);
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

        return res.status(201).json({ message: `${uploaded.length} file(s) uploaded successfully`, uploaded });
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
    return res.status(200).json({ teamId, assignId, files })
}

//Get all files submitted in assignment for admin view.
exports.getAllFilesInAssignment = async (req, res) => {
    const assignId = req.params.aId;
    const files = await fileHandle.getAllFilesByAssignmentId(assignId);
    const userFileMap = {};
    files.forEach(file => {
        if (!userFileMap[file.user_id]) {
            userFileMap[file.user_id] = {
                user: {
                    id: file.user_id,
                    firstname: file.firstname,
                    lastname: file.lastname,
                    avatar_hash: file.avatar_hash,
                    avatar_ext: file.avatar_ext,
                    status: file.status,
                    submitted_at: file.submitted_at
                },
                files: []
            };
        }
        userFileMap[file.user_id].files.push(file);   
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
    console.log(`Request to delete file: ${fileId}.${fileExt} in assignment ${assignId} by user ${sessionUserId}`);
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