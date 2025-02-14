"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Event = require("../models/event");
const Feedback = require("../models/feedback");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getAdminId,
  getUserId,
  getEventId,
} = require("./_testCommon");
let userId;
beforeAll(async () => {
  await commonBeforeAll();
  userId = getUserId();
});

// beforeEach(commonBeforeEach);
let adminToken;
let userToken;

beforeEach(async () => {
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "adminpassword" });

  adminToken = loginRes.body.token;

  const userLoginRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@test.com", password: "userpassword" });
  userToken = userLoginRes.body.token;

  await db.query("BEGIN");
});

afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Admin Routes", () => {
  /** GET /admin/users */
  describe("GET /admin/users", () => {
    test("Admin can get all users", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.users.length).toBeGreaterThanOrEqual(2);
    });

    test("Unauthorized user cannot access this route", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(401);
    });
  });

  /** DELETE /admin/users/:id */
  describe("DELETE /admin/users/:id", () => {
    test("Admin can delete a user", async () => {
      const idToDelete = getUserId();
      const res = await request(app)
        .delete(`/admin/users/${idToDelete}`)
        .set("Authorization", `Bearer ${adminToken}`);
      console.log("User ID:", idToDelete);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("User deleted successfully.");
    });

    test("Deleting non-existent user returns 404", async () => {
      const res = await request(app)
        .delete("/admin/users/9999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  /** PATCH /admin/users/:id/role */
  describe("PATCH /admin/users/:id/role", () => {
    test("Admin can update user role", async () => {
      const res = await request(app)
        .patch(`/admin/users/${userId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "admin" });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.role).toBe("admin");
    });

    test("Invalid role returns error", async () => {
      const res = await request(app)
        .patch(`/admin/users/${userId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "invalidRole" });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.message).toBe(
        "Invalid role. Allowed values: 'admin', 'user'."
      );
    });
  });

  /** GET /admin/events */
  describe("GET /admin/events", () => {
    test("Admin can get all events", async () => {
      const res = await request(app)
        .get("/admin/events")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.events.length).toBeGreaterThanOrEqual(1);
    });
  });

  /** DELETE /admin/events/:id */
  describe("DELETE /admin/events/:id", () => {
    test("Admin can delete an event", async () => {
      const res = await request(app)
        .delete("/admin/events/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Event deleted successfully.");
    });
  });

  /** GET /admin/feedback */
  describe("GET /admin/feedback/:eventId", () => {
    test("Admin can get all feedback", async () => {
      const eventId = getEventId();
      console.log("Event ID:", eventId);
      const res = await request(app)
        .get(`/admin/feedback/${eventId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.feedback.length).toBeGreaterThanOrEqual(1);
    });
  });

  /** DELETE /admin/feedback/:id */
  describe("DELETE /admin/feedback/:id", () => {
    test("Admin can delete feedback", async () => {
      const res = await request(app)
        .delete("/admin/feedback/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Feedback deleted successfully.");
    });
  });
});
