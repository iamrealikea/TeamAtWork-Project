const getDashboard = async (req, res) => {
    res.render('dashboard/dashboard', { 
        data: {},
        //TODO: Pass data to dashboard view
    });
};

module.exports = { getDashboard };