const Team = require('../../models/teamModel')
const Assignment = require('../../models/assignmentModel')


const parsePositiveInt = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// GET all teams for the user
exports.getAllTeams = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teams = await Team.getUserTeams(sessionUserId)
    const teamMemberMap = {}
    for (const team of teams) {
        teamMemberMap[team.id] = await Team.getTeamMembers(team.id);
    }
    return res.json({ teams, teamMemberMap })
}

// GET team by ID with members and assignments
exports.getTeamIdView = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = parsePositiveInt(req.params.tId);
    if (!teamId) {
        return res.status(404).render('dashboard/error', { message: 'Require team ID', statusCode: 404 });
    }

    const team = await Team.getTeamById(teamId, sessionUserId);
    if (!team) {
        return res.status(403).render('dashboard/error', { message: 'You are not a member of this team', statusCode: 403 });
    }

    const teamMember = await Team.getTeamMembers(teamId);
    const assignments = await Assignment.getTeamAssignment(teamId);
    return res.render('team/teamId', { team, teamMember, assignments });
}

exports.getTeamEditView = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = parsePositiveInt(req.params.tId);
    if (!teamId) {
        return res.status(404).render('dashboard/error', { message: 'Team Id not found', statusCode: 404 });
    }
    const team = await Team.getTeamById(teamId, sessionUserId);
    if (!team) {
        return res.status(404).render('dashboard/error', { message: 'Team not found', statusCode: 404 });
    } 
    return res.render('team/teamEdit', { team });
}

// DELETE team by ID
exports.deleteTeamById = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    await Team.deleteTeam(teamId, sessionUserId);
    return res.json({ message: 'Deleted' });
}

// GET assignment by ID for a team
exports.getTeamAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const action = req.query.action;
    const teamId = req.params.tId;
    const member = await Team.getTeamById(teamId, sessionUserId);
    const assignId = req.params.aId;
    const assignments = await Assignment.getAssignmentById(assignId)
    if (!assignments) 
        return res.status(404).json({ error: 'Assignment not found' });
    if (action === 'view') {
        return res.render('team/assignmentId', { assignment: assignments, user:member });
    }
    if (action === 'edit' && member.role === 'Manager') {
        return res.render('team/assignmentEditId', { assignment: assignments });
    } else {
        return res.status(403).json({ error: 'Forbidden' });
    }
}

// POST create assignment for a team
exports.postAssignment = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const { title, description, due_date } = req.body;
    const result = await Assignment.postAssignment(
        title, description, teamId, sessionUserId, due_date
    )
    return res.json(result)
}

exports.uploadFile = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = req.params.tId;
    const assignId = req.params.aId;
    if (!req.file) {
        return res.status(400).json({ message: 'Invalid file upload' });
    } try {
        const fileRecord = await Assignment.uploadFile(
            assignId, sessionUserId, req.fileHash, req.fileExt, teamId
        )
        return res.json({ message: 'File uploaded successfully', file: fileRecord });
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}