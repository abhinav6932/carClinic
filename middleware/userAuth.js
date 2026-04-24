const userAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/auth/login');
};

module.exports = userAuth;
