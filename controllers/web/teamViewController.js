const Team = require('../../models/teamModel')
const Assignment = require('../../models/assignmentModel')
const User = require('../../models/userModel')
const { nanoid } = require('nanoid');


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
    return res.render('team/allTeam', { teams, teamMemberMap })
}

// GET team by ID with members and assignments
exports.getTeamIdView = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const sessionUser = req.session?.user;
    const teamId = parsePositiveInt(req.params.tId);
    if (!teamId) {
        return res.status(404).render('dashboard/error', { message: 'Require team ID', statusCode: 404 });
    }

    const team = sessionUser?.isAdmin
        ? await Team.getTeamByIdAdmin(teamId)
        : await Team.getTeamById(teamId, sessionUserId);
    if (!team) {
        return res.status(403).render('dashboard/error', { message: 'You are not a member of this team', statusCode: 403 });
    }

    const teamMember = await Team.getTeamMembers(teamId);
    const assignments = await Assignment.getTeamAssignment(teamId);
    const assignmentsWithStatus = await Promise.all(
        assignments.map(async (assignment) => {
            const status = await Assignment.checkStatus(assignment.id, sessionUserId);
            return {
                ...assignment,
                myStatus: status?.status || null,
                isMine: Boolean(status)
            };
        })
    );
    console.log(team, teamMember, assignmentsWithStatus)
    return res.render('team/teamId', { team, members: teamMember, assignments: assignmentsWithStatus, isAdmin: sessionUser?.isAdmin === true });
}

exports.getTeamEditView = async (req, res) => {
    const sessionUser = req.session?.user;
    const sessionUserId = sessionUser?.id;
    const teamId = parsePositiveInt(req.params.tId);
    if (!teamId) {
        return res.status(404).render('dashboard/error', { message: 'Team Id not found', statusCode: 404 });
    }

    const team = sessionUser?.isAdmin
        ? await Team.getTeamByIdAdmin(teamId)
        : await Team.getTeamById(teamId, sessionUserId);
    if (!team) {
        return res.status(404).render('dashboard/error', { message: 'Team not found', statusCode: 404 });
    }

    const members = await Team.getTeamMembers(teamId);
    members.sort((a, b) => {
        if (a.role === 'Manager' && b.role !== 'Manager') return -1;
        if (a.role !== 'Manager' && b.role === 'Manager') return 1;
        return 0;
    });
    const memberIds = members.map((member) => member.id);
    const users = await User.getAll();
    const isManager = team.role === 'Manager';

    if (!sessionUser?.isAdmin && !isManager) {
        return res.status(403).render('dashboard/error', { message: 'Manager privilege required', statusCode: 403 });
    }

    return res.render('team/teamEdit', { team, members, users, memberIds, isAdmin: sessionUser?.isAdmin === true, currentUserId: sessionUserId });
}

// GET create team form
exports.getCreateTeamView = async (req, res) => {
    console.log('getCreateTeamView called');
    try {
        const users = await User.getAll();
        const currentUserId = req.session.user.id;
        console.log('Rendering createTeam with', users.length, 'users');
        res.render('team/createTeam', { users, currentUserId });
    } catch (error) {
        console.error('Error in getCreateTeamView:', error);
        res.status(500).render('dashboard/error', { message: 'Internal server error', statusCode: 500 });
    }
}

// GET new assignment form
exports.getNewAssignmentView = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const teamId = parsePositiveInt(req.params.tId);
    if (!teamId) {
        return res.status(404).render('dashboard/error', { message: 'Require team ID', statusCode: 404 });
    }

    const team = await Team.getTeamById(teamId, sessionUserId);
    if (!team) {
        return res.status(403).render('dashboard/error', { message: 'You are not a member of this team', statusCode: 403 });
    }

    return res.render('team/newAssignment', { team });
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
    let status = await Assignment.checkStatus(assignId, sessionUserId);
    if (!status){
        status = { status: 'Unclaimed' }
    }
    console.log(status)
    if (!assignments) 
        return res.status(404).json({ error: 'Assignment not found' });
    if (action === 'view') {
        return res.render('team/assignmentId', { assignment: assignments, user:member, status });
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
    let genID = nanoid(12);
    
    try {
        let idValidation = await Assignment.getAssignmentById(genID);
        if (idValidation) {
            genID = nanoid(12);
            idValidation = await Assignment.getAssignmentById(genID);
        } 
    } catch (error) {
        console.error('Error validating assignment ID', error);
        return res.status(500).redirect('error', { message: 'Internal server error. Please try again later.', statusCode: 500 });
    }
    
    const result = await Assignment.postAssignment(
        title, description, teamId, sessionUserId, due_date, genID
    )
    const addManager = await Assignment.managerClaimAssignment(result[0].id, sessionUserId);
    const createdId = Array.isArray(result) ? result[0]?.id : result?.id;
    if (createdId) {
        return res.redirect(`/team/${teamId}/assign/${createdId}?action=view`);
    }
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