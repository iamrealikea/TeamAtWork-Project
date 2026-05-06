const express = require('express')
const router = express.Router();
const dashboardControl = require('../../controllers/web/dashboardController');
const { requireAuth, requireGuest, requireAdmin } = require('../../middleware/authMiddleware');   

router.get('/', requireAuth, dashboardControl.getDashboard);
router.get('/dashboard', requireAuth, dashboardControl.getDashboard);
router.get('/admin', requireAuth, requireAdmin, dashboardControl.getAdminDashboard);
router.get('/account', requireAuth, dashboardControl.getSetting);

module.exports = router;