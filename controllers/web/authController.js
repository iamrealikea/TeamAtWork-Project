const bcrypt = require('bcrypt');
const User = require('../../models/userModel');

const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const ADMIN_EMAILS = new Set(
    (process.env.ADMIN_EMAILS)
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
);

const isAdminAccount = (user) => {
    const role = (user?.role || '').toString().trim().toLowerCase();
    const email = (user?.email || '').toString().trim().toLowerCase();

    return user?.is_admin === true || role === 'admin' || ADMIN_EMAILS.has(email);
};

const toRegisterViewModel = (body = {}, error = null) => ({
    error,
    values: {
        name: (body.name || '').trim(),
        email: (body.email || '').trim(),
    },
});

const toLoginViewModel = (body = {}, error = null) => ({
    error,
    values: {
        email: (body.email || '').trim(),
    },
});

const establishSession = (req, user) => new Promise((resolve, reject) => {
    req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
            return reject(regenerateErr);
        }

        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            isAdmin: isAdminAccount(user),
        };

        return req.session.save((saveErr) => {
            if (saveErr) {
                return reject(saveErr);
            }
            return resolve();
        });
    });
});

const getLogin = async (req, res) => {
    res.render('authenticate/login', toLoginViewModel());
};

const getRegister = async (req, res) => {
    res.render('authenticate/signin', toRegisterViewModel());
};

const postRegister = async (req, res) => {
    const firstname = (req.body.firstname).trim();
    const lastname = (req.body.lastname).trim();
    const username = (req.body.username).trim()
    const email = (req.body.email).trim();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!firstname || !lastname || !username || !email || !password || !confirmPassword) {
        return res.status(400).render('authenticate/signin', toRegisterViewModel(req.body, 'All fields are required.'));
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).render('authenticate/signin', toRegisterViewModel(req.body, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`));
    }

    if (password !== confirmPassword) {
        return res.status(400).render('authenticate/signin', toRegisterViewModel(req.body, 'Passwords do not match.'));
    }

    try {
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            return res.status(409).render('authenticate/signin', toRegisterViewModel(req.body, 'An account with this email already exists.'));
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const newUser = await User.createUser({
            firstname,
            lastname,
            username,
            email,
            passwordHash,
        });

        await establishSession(req, newUser);
        return res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        return res.status(500).render('authenticate/signin', toRegisterViewModel(req.body, 'Unable to register right now. Please try again.'));
    }
};

const postLogin = async (req, res) => {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
        return res.status(400).render('authenticate/login', toLoginViewModel(req.body, 'Email and password are required.'));
    }

    try {
        const user = await User.getByEmail(email);

        if (!user || !user.password_hash) {
            return res.status(401).render('authenticate/login', toLoginViewModel(req.body, 'Invalid email or password.'));
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).render('authenticate/login', toLoginViewModel(req.body, 'Invalid email or password.'));
        }

        await establishSession(req, user);
        return res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        return res.status(500).render('authenticate/login', toLoginViewModel(req.body, 'Unable to sign in right now. Please try again.'));
    }
};

const postLogout = async (req, res) => {
    if (!req.session) {
        return res.redirect('/login');
    }

    return req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).redirect('/dashboard');
        }

        res.clearCookie('connect.sid');
        return res.redirect('/login');
    });
};

module.exports = {
    getLogin,
    getRegister,
    postRegister,
    postLogin,
    postLogout,
};