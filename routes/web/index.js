const express = require('express')
const router = express.Router();
const dashboardControl = require('../../controllers/web/dashboardController');
const authControl = require('../../controllers/web/authController');

router.get('/', dashboardControl.getDashboard);
router.get('/dashboard', dashboardControl.getDashboard);

router.get('/login', authControl.getLogin);
router.get('/register', authControl.getRegister);

module.exports = router;