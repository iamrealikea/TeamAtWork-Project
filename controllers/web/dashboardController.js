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

module.exports = { getDashboard };