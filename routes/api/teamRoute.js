const express = require('express')
const router = express.Router()
const controller = require('../../controllers/api/teamController')
const assignController = require('../../controllers/api/assignmentController')
const { requireAuth } = require('../../middleware/authMiddleware')
const { fileUpload } = require('../../config/multer')

router.use(requireAuth)

// team
router.get('/', controller.getUserTeams)
router.get('/:teamId', controller.getTeamById)
router.post('/', controller.createTeam)
router.patch('/:teamId', controller.updateTeam)
router.delete('/:teamId', controller.deleteTeam)

// members
router.get('/:teamId/members', controller.getMembers)
router.post('/:teamId/members', controller.addMember)
router.delete('/:teamId/members/:userId', controller.removeMember)

router.get('/:tId/assign/:aId', requireAuth, assignController.getTeamAssignment);
router.post('/:tId/assign', requireAuth, assignController.postAssignment);
router.post('/:tId/assign/:aId/upload', requireAuth, fileUpload.array('files'), assignController.fileUpload);
module.exports = router