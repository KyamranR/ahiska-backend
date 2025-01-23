const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user by verifying JWT token */
function authenticateJWT(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (token) {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next(); // If no token, proceed without user
  }
}

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

/** Middleware to ensure the user is an admin */
function ensureAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (user && user.role === "admin") {
      return next();
    }
    throw new UnauthorizedError("Unauthorized: Admin privileges required.");
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdmin,
};
