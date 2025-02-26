"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getUserId,
  getAdminId,
  getAdminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let userToken;

beforeEach(async () => {
  const res = await request(app).post("/auth/login").send({
    email: "user@test.com",
    password: "userpassword",
  });

  userToken = res.body.token;
});

/** POST /users/register => Register a new user */
describe("POST /users/register", () => {
  test("Register a new user", async () => {
    const res = await request(app).post("/users/register").send({
      email: "newuser@test.com",
      password: "newpassword",
      firstName: "New",
      lastName: "User",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("newuser@test.com");
  });

  test("Fails with invalid data", async () => {
    const res = await request(app).post("/users/register").send({
      email: "not-an-email",
      password: "short",
    });

    expect(res.statusCode).toBe(400);
  });
});

/** GET /users/:id => Get a user by ID */
describe("GET /users/:id", () => {
  test("Gets a user by ID", async () => {
    const res = await request(app)
      .get(`/users/${getUserId()}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty("id", getUserId());
  });

  test("Fails for unauthenticated request", async () => {
    const res = await request(app).get(`/users/${getUserId()}`);
    expect(res.statusCode).toBe(401);
  });

  test("Fails for unauthorized user", async () => {
    const res = await request(app)
      .get(`/users/${getAdminId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });

  test("Fails for non existing user", async () => {
    const res = await request(app)
      .get("/users/9999")
      .set("Authorization", `Bearer ${getAdminToken()}`);

    expect(res.statusCode).toBe(404);
  });
});

/** PATCH /users/:id => Update user */
describe("PATCH /users/:id", () => {
  test("Successfully updates user", async () => {
    const res = await request(app)
      .patch(`/users/${getUserId()}`)
      .send({ firstName: "Updated" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.firstName).toBe("Updated");
  });

  test("Fails with invalid data", async () => {
    const res = await request(app)
      .patch(`/users/${getUserId()}`)
      .send({ email: "not-an-email" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(400);
  });

  test("Fails for unauthorized update", async () => {
    const res = await request(app)
      .patch(`/users/${getAdminId()}`)
      .send({ firstName: "Hack" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });

  test("Fails for non-existent user", async () => {
    const res = await request(app)
      .patch("/users/9999")
      .send({ firstName: "Ghost" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });
});

/** PATCH /users/:id/password => Change password */
describe("PATCH /users/:id/password", () => {
  test("Successfully changes password", async () => {
    const res = await request(app)
      .patch(`/users/${getUserId()}/password`)
      .send({ newPassword: "newpassword" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password updated successfully.");
  });

  test("Fails with short password", async () => {
    const res = await request(app)
      .patch(`/users/${getUserId()}/password`)
      .send({ newPassword: "123" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(400);
  });

  test("Fails for unauthorized password change", async () => {
    const res = await request(app)
      .patch(`/users/${getAdminId()}/password`)
      .send({ newPassword: "hackedpassword" })
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });
});

/** DELETE /users/:id => Delete user */
describe("DELETE /users/:id", () => {
  test("Successfully deletes user", async () => {
    const res = await request(app)
      .delete(`/users/${getUserId()}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully.");
  });

  test("Fails for unauthorized delete", async () => {
    const res = await request(app)
      .delete(`/users/${getAdminId()}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });

  test("Fails for non existing user", async () => {
    const res = await request(app)
      .delete(`/users/9999`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(401);
  });
});
