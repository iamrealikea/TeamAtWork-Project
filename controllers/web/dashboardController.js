const User = require('../../models/userModel');
const Team = require('../../models/teamModel');

const getDashboard = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const user = await User.getById(sessionUserId);
    const teams = await Team.getUserTeams(sessionUserId);
    const teamMembersMap = {};

    // Fetch members for each team
    for (const team of teams) {
        teamMembersMap[team.id] = await Team.getTeamMembers(team.id);
    }
    if (!user) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
        return;
    }

    res.render('dashboard/dashboard', {
        data: {
            user,
            teams: teams,
            teamMembers: teamMembersMap
        }
    });
};

const getAdminDashboard = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const sessions = await User.getActiveSession();
    const teams = await Team.getAllTeams();
    const users = await User.getAll();
    const teamsWithMembers = await Promise.all(
        teams.map(async (team) => ({
            ...team,
            members: await Team.getTeamMembers(team.id)
        }))
    );
    res.render('dashboard/admin', {sessions, users, teams: teamsWithMembers});
}

const getSetting = async (req, res) => {
    const sessionUserId = req.session?.user?.id;
    const user = await User.getById(sessionUserId);

    res.render('account/setting', { user });
};

module.exports = { getDashboard, getAdminDashboard, getSetting };