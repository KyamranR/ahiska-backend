"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
  commonAfterEach,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** User registration POST /auth/register */
describe("POST /auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "newuser@test.com",
      password: "newpassword",
      firstName: "new",
      lastName: "user",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail with missing fields", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "invalid@test.com",
      password: "password",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /auth/login", () => {
  it("should log in a user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "user@test.com",
      password: "userpassword",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail with missing fields", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "user@test.com",
    });

    expect(res.statusCode).toBe(400);
  });

  it("should fail with invalid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "user@test.com",
      password: "wrongpassword",
    });

    expect(res.body).toEqual({
      error: {
        message: "Invalid email/password.",
        status: 500,
      },
    });
  });
});

describe("POST /auth/logout", () => {
  it("should successfully logout", async () => {
    const res = await request(app).post("/auth/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Logged out successfully." });
  });
});
