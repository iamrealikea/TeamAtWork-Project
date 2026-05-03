const express = require('express')
const router = express.Router();
const teamsControl = require('../../controllers/web/teamViewController');
const { requireAuth, requireGuest } = require('../../middleware/authMiddleware');   

// Team routes
router.get('/', requireAuth, teamsControl.getAllTeams);
router.get('/:tId', requireAuth, teamsControl.getTeamIdView);
router.delete('/:tId', requireAuth, teamsControl.deleteTeamById);

// Assignment routes
router.get('/:tId/assign/:aId', requireAuth, teamsControl.getTeamAssignment);
router.post('/:tId/assign/', requireAuth, teamsControl.postAssignment);

module.exports = router;