const getLogin = async (req, res) => {
    res.render('authenticate/login');
}
const getRegister = async (req, res) => {
    res.render('authenticate/register');
}

module.exports = { getLogin, getRegister };