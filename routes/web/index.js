const express = require('express')
const router = express.Router();
const dashboardControl = require('../../controllers/web/dashboardController');
const { requireAuth, requireGuest } = require('../../middleware/authMiddleware');   

router.get('/', requireAuth, dashboardControl.getDashboard);
router.get('/dashboard', requireAuth, dashboardControl.getDashboard);

module.exports = router;