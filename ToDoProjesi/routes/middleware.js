module.exports = function (app) {

    app.use(function (req, res, next) {
        res.locals.loggedUser = req.session.loggedUser;
        next();
    });

};
