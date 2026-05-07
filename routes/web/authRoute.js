const express = require('express')
const router = express.Router();
const authControl = require('../../controllers/web/authController');
const { requireAuth, requireGuest } = require('../../middleware/authMiddleware');

router.get('/login', requireGuest, authControl.getLogin);
router.post('/login', requireGuest, authControl.postLogin);

router.get('/register', requireGuest, authControl.getRegister);
router.post('/register', requireGuest, authControl.postRegister);
router.post('/logout', requireAuth, authControl.postLogout);

module.exports = router;