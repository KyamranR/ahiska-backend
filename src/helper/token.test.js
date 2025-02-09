const jwt = require("jsonwebtoken");
const { createToken } = require("../helper/tokens");
const { SECRET_KEY } = require("../config");

describe("createToken", () => {
  it("should generate a valid JWT with correct payload", () => {
    const user = {
      id: 1,
      email: "test@example.com",
      role: "user",
    };

    const token = createToken(user);
    expect(typeof token).toBe("string");

    // Decode the token to verify the payload
    const decoded = jwt.verify(token, SECRET_KEY);

    expect(decoded).toMatchObject({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    expect(decoded).toHaveProperty("iat"); // JWT tokens include an issue timestamp (iat)
  });

  it("should throw an error for invalid secret verification", () => {
    const user = { id: 1, email: "invalid@example.com", role: "admin" };
    const token = createToken(user);

    // Verifying with a wrong secret should throw an error
    expect(() => jwt.verify(token, "wrong-secret")).toThrow();
  });
});
