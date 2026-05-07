const { requireAuth, requireAdmin } = require('../../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/api/adminController');
router.use(requireAuth);

router.get('/teams/all', requireAdmin, controller.getAllTeams);
router.get('/users/all', requireAdmin, controller.getAllUsers);
router.get('/users/active', requireAdmin, controller.getActiveSessions);
router.patch('/teams/:teamId', requireAdmin, controller.updateTeam);
router.patch('/users/:userId', requireAdmin, controller.updateUser);
router.delete('/teams/:teamId', requireAdmin, controller.deleteTeam);

module.exports = router