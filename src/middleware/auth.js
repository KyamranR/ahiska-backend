const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware to ensure user is logged in */
function ensureLoggedIn(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer /, "");
    const payload = jwt.verify(token, SECRET_KEY);
    res.locals.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError("Unauthorized: Please log in."));
  }
}

/** Middleware to ensure the correct user or admin */
function ensureCorrectUser(req, res, next) {
  try {
    const user = res.locals.user;
    if (user && (user.id === +req.params.id || user.role === "admin")) {
      return next();
    }
    throw new UnauthorizedError("Unauthorized: Access denied.");
  } catch (err) {
    return next(err);
  }
}

module.exports = { ensureLoggedIn, ensureCorrectUser };
