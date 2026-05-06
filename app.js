const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const dbPool = require('./config/db');
require('dotenv').config();
const app = express();
const port = process.env.PORT;
const isProduction = process.env.NODE_ENV === 'production';

const sessionSecret = process.env.SESSION_SECRET;
const sessionMaxAge = Number(process.env.COOKIE_MAX_AGE)

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
	store: new PgSession({
		pool: dbPool,
		tableName: 'user_sessions',
		createTableIfMissing: true,
	}),
	secret: sessionSecret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		sameSite: 'lax',
		secure: isProduction,
		maxAge: sessionMaxAge,
	},
}));

app.use((req, res, next) => {
	res.locals.currentUser = req.session?.user || null;
	next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const userApiRoutes = require('./routes/api/userRoute');
const teamApiRoutes = require('./routes/api/teamRoute');
const adminApiRoutes = require('./routes/api/adminRoute');
const webRoutes = require('./routes/web/index');
const authWebRoutes = require('./routes/web/authRoute');
const teamWebRoutes = require('./routes/web/teamRoute');

app.use('/', webRoutes);
app.use('/', authWebRoutes);
app.use('/team', teamWebRoutes);

app.use('/api/admin', adminApiRoutes);
app.use('/api/user', userApiRoutes);
app.use('/api/team', teamApiRoutes);

app.use((req, res) => {
	const wantsJson = req.path.startsWith('/api') || req.accepts(['json', 'html']) === 'json';
	if (wantsJson) {
		return res.status(404).json({ message: 'Error 404 Page not found' });
	}

	return res.status(404).render('dashboard/error', {
		message: 'Page not found',
		statusCode: 404,
	});
});

app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});
