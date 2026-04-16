const express = require('express')
const router = express.Router()
const controller = require('../controllers/team.controller')
const auth = require('../middleware/auth')

// team
router.get('/teams', auth, controller.getTeams)
router.get('/teams/:teamId', auth, controller.getTeamById)
router.post('/teams', auth, controller.createTeam)
router.patch('/teams/:teamId', auth, controller.updateTeam)
router.delete('/teams/:teamId', auth, controller.deleteTeam)

// members
router.get('/teams/:teamId/members', auth, controller.getMembers)
router.post('/teams/:teamId/members', auth, controller.addMember)
router.delete('/teams/:teamId/members/:userId', auth, controller.removeMember)

module.exports = router