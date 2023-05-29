module.exports = {
    nivelAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.nivelAdmin == 1) {
      return next();
    }

    req.flash("error_msg", "Você precisa ser um ADM");
    res.redirect("/");
  },
};
