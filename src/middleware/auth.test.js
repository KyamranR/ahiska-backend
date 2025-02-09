const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const {
  extractToken,
  authenticateJWT,
  ensureAdmin,
  ensureCorrectUser,
  ensureLoggedIn,
} = require("../middleware/auth");

const mockRequest = (headers = {}, params = {}) => ({
  headers,
  params,
});

const mockResponse = () => {
  const res = {};
  res.locals = {};
  return res;
};

const mockNext = jest.fn();

describe("Authentication Middleware", () => {
  let token;
  let testUser;
  let adminUser;

  beforeAll(() => {
    testUser = { id: 1, username: "testuser", role: "user" };
    adminUser = { id: 2, username: "adminuser", role: "admin" };
    token = jwt.sign(testUser, SECRET_KEY);
  });

  describe("extractToken", () => {
    it("should extract the token from the Authorization header", () => {
      const req = mockRequest({ authorization: `Bearer ${token}` });
      expect(extractToken(req)).toBe(token);
    });

    it("should return null if no Authorization header is present", () => {
      const req = mockRequest({});
      expect(extractToken(req)).toBeNull();
    });

    it("should return null if the Authorization header is malformed", () => {
      const req = mockRequest({ authorization: "Bearer" });
      expect(extractToken(req)).toBeNull();
    });
  });

  describe("authenticateJWT", () => {
    it("should set res.locals.user if a valid token is provided", () => {
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();
      authenticateJWT(req, res, mockNext);
      expect(res.locals.user).toEqual(expect.objectContaining(testUser));
      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next() without setting user if no token is provided", () => {
      const req = mockRequest({});
      const res = mockResponse();
      authenticateJWT(req, res, mockNext);
      expect(res.locals.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next() without setting user if an invalid token is provided", () => {
      const req = mockRequest({ authorization: `Bearer invalid_token` });
      const res = mockResponse();
      authenticateJWT(req, res, mockNext);
      expect(res.locals.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("ensureLoggedIn", () => {
    it("should call next() if the user is logged in", () => {
      const req = mockRequest({ authorization: `Bearer ${token}` });
      const res = mockResponse();
      ensureLoggedIn(req, res, mockNext);
      expect(res.locals.user).toEqual(expect.objectContaining(testUser));
      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next() with UnauthorizedError if no token is provided", () => {
      const req = mockRequest({});
      const res = mockResponse();
      ensureLoggedIn(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedError("Unauthorized: Please log in.")
      );
    });

    it("should call next() with UnauthorizedError if invalid token is provided", () => {
      const req = mockRequest({ authorization: `Bearer invalid_token` });
      const res = mockResponse();
      ensureLoggedIn(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedError("Unauthorized: Please log in.")
      );
    });
  });

  describe("ensureCorrectUser", () => {
    it("should call next() if the user is the correct user", () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      res.locals.user = testUser;
      ensureCorrectUser(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next() if the user is an admin", () => {
      const req = mockRequest({}, { id: "5" }); // Some other id
      const res = mockResponse();
      res.locals.user = adminUser;
      ensureCorrectUser(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next() with UnauthorizedError if the user is not the correct user and not an admin", () => {
      const req = mockRequest({}, { id: "5" }); // Some other id
      const res = mockResponse();
      res.locals.user = testUser;
      ensureCorrectUser(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedError("Unauthorized: Access denied.")
      );
    });

    it("should call next() with UnauthorizedError if no user is logged in", () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();
      ensureCorrectUser(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedError("Unauthorized: Access denied.")
      );
    });
  });

  describe("ensureAdmin", () => {
    it("should call next() if the user is an admin", () => {
      const req = mockRequest({});
      const res = mockResponse();
      res.locals.user = adminUser;
      ensureAdmin(req, res, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next() with UnauthorizedError if the user is not an admin", () => {
      const req = mockRequest({});
      const res = mockResponse();
      res.locals.user = testUser;
      ensureAdmin(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedError("Unauthorized: Admin privileges required.")
      );
    });

    it("should call next() with UnauthorizedError if no user is logged in", () => {
      const req = mockRequest({});
      const res = mockResponse();
      ensureAdmin(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        new UnauthorizedError("Unauthorized: Admin privileges required.")
      );
    });
  });
});
