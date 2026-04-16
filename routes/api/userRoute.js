const express = require('express')
const router = express.Router()
const controller = require('../../controllers/api/userController')
const { avatarUpload } = require('../../config/multer')
//const auth = require('../middleware/auth')

router.get('/:id', /*auth,*/ controller.getMe)
router.post('/:id', /*auth,*/ controller.updateMe)
router.post('/:id/avatar', /*auth,*/ avatarUpload.single('avatar'), controller.updateAvatar)

module.exports = router