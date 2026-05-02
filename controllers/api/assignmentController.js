const Assignment = require('../../models/assignmentModel');
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
        for (let i = 0; i < files.length; i += 1) {
            const file = files[i];
            const destPath = path.join(FILE_DIR, `${assignId}_${Date.now()}_${file.originalname}`);
            fs.writeFileSync(destPath, file.buffer);
        }
        
    } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ error: 'File upload failed' });
    }
}