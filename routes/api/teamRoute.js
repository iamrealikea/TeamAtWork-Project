const express = require('express')
const router = express.Router()
const controller = require('../../controllers/api/teamController')
const assignController = require('../../controllers/api/assignmentController')
const { requireAuth, requireManager } = require('../../middleware/authMiddleware')
const { fileUpload } = require('../../config/multer')

router.use(requireAuth)

// team
router.get('/', requireAuth, controller.getUserTeams)
router.get('/:teamId', requireAuth, controller.getTeamById)
router.post('/', requireAuth, controller.createTeam)
router.patch('/:teamId', requireAuth, controller.updateTeam)
router.delete('/:teamId', requireAuth, controller.deleteTeam)

// members
router.get('/:teamId/members', requireAuth, controller.getMembers)
router.post('/:teamId/members', requireAuth, requireManager,  controller.addMember)
router.delete('/:teamId/members/:userId', requireAuth, requireManager, controller.removeMember)

router.get('/:tId/assign/:aId', requireAuth, assignController.getTeamAssignment);
router.post('/:tId/assign', requireAuth, requireManager,  assignController.postAssignment);

// assignment claim/unclaim with query param ?action=claim or ?action=unclaim
router.patch('/:tId/assign/:aId', requireAuth, assignController.claimAssignment);

//File handle routes
router.post('/:tId/assign/:aId/upload', requireAuth, fileUpload.array('files'), assignController.fileUpload);
router.get('/:tId/assign/:aId/files/download/:file', requireAuth, assignController.downloadFileFromId);
router.get('/:tId/assign/:aId/files', requireAuth, assignController.getFileInUserAssignment);
router.get('/:tId/assign/:aId/files/all', requireAuth, requireManager, assignController.getAllFilesInAssignment);
router.delete('/:tId/assign/:aId/files/:file', requireAuth, assignController.deleteFileInUserAssignment);
module.exports = router