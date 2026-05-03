const express = require('express')
const router = express.Router()
const controller = require('../../controllers/api/userController')
const { avatarUpload } = require('../../config/multer')
const { requireAuth, requireAdmin, requireSessionOwner } = require('../../middleware/authMiddleware')

router.use(requireAuth)

router.get('/all', requireAdmin, controller.getAllUsers)
router.get('/myassign', requireAuth, controller.getMyAssignments)
router.get('/:id', requireSessionOwner, controller.getMe)
router.post('/:id', requireSessionOwner, controller.updateMe)
router.post('/:id/avatar', requireSessionOwner, avatarUpload.single('avatar'), controller.updateAvatar)

module.exports = router