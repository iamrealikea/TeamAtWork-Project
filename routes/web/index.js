const express = require('express')
const router = express.Router();
const dashboardControl = require('../../controllers/web/dashboardController');
const teamsControl = require('../../controllers/web/teamViewController');
const authControl = require('../../controllers/web/authController');
const { requireAuth, requireGuest } = require('../../middleware/authMiddleware');

router.get('/login', requireGuest, authControl.getLogin);
router.post('/login', requireGuest, authControl.postLogin);

router.get('/register', requireGuest, authControl.getRegister);
router.post('/register', requireGuest, authControl.postRegister);

router.get('/', requireAuth, dashboardControl.getDashboard);
router.get('/dashboard', requireAuth, dashboardControl.getDashboard);
router.post('/logout', requireAuth, authControl.postLogout);

//router.get('/teams/:id', requireAuth, teamsControl.getTeam);

module.exports = router;