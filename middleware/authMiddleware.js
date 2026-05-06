const Team = require('../models/teamModel');

const wantsJson = (req) => (
  req.originalUrl.startsWith('/api/') || req.xhr || req.get('accept')?.includes('application/json')
);

const requireAuth = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }

  if (wantsJson(req)) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  return res.redirect('/login');
};

const requireGuest = (req, res, next) => {
  if (req.session?.user) {
    return res.redirect('/dashboard');
  }
  return next();
};

const requireAdmin = (req, res, next) => {
  if (req.session?.user?.isAdmin) {
    return next();
  }

  if (wantsJson(req)) {
    return res.render('dashboard/error', { message: 'Admin privilege required', statusCode: 401 });
  }

  return res.render('dashboard/error', { message: 'Admin privilege required', statusCode: 401 });
};

const requireSessionOwner = (req, res, next) => {
  const sessionUserId = Number(req.session?.user?.id);
  const requestUserId = Number(req.params.id);

  if (req.session?.user?.isAdmin) {
    return next();
  }

  if (Number.isNaN(requestUserId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  if (sessionUserId !== requestUserId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return next();
};

const requireManager = async (req, res, next) => {
  const sessionUserId = Number(req.session?.user?.id);
  const teamId = Number(req.params.tId);
  const data = await Team.getTeamById(teamId, sessionUserId);
  console.log('User role in team:', data);
  if (data.role !== 'Manager') {
    return res.status(403).json({ message: 'Manager privilege required' });
  }
  if (data?.id !== teamId) {
    return res.status(500).json({ message: 'Internal server error. Team ID mismatch' });
  }
  return next( console.log('Manager access granted') );
}

module.exports = {
  requireAuth,
  requireGuest,
  requireAdmin,
  requireSessionOwner,
  requireManager
};
