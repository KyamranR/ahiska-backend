"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterAll,
  commonAfterEach,
  getUserId,
  getAdminId,
  getEventId,
  getAdminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let userToken;
let eventId;

beforeEach(async () => {
  eventId = getEventId();

  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@test.com", password: "userpassword" });
  userToken = loginRes.body.token;
});

/** POST /events/:eventId/feedback => Add feedback */
describe("POST /events/:eventId/feedback", () => {
  test("Allows logged-in user to add feedback", async () => {
    const res = await request(app)
      .post(`/events/${eventId}/feedback`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        content: "This is a test feedback",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      feedback: expect.objectContaining({
        id: expect.any(Number),
        content: "This is a test feedback",
        eventId: eventId,
        userId: getUserId(),
      }),
    });
  });

  test("Rejects unauthorized user", async () => {
    const res = await request(app)
      .post(`/events/${eventId}/feedback`)
      .send({ content: "Unauthorized feedback" });
    expect(res.statusCode).toBe(401);
  });

  test("Rejects invalid if feedback content is empty", async () => {
    const res = await request(app)
      .post(`/events/${eventId}/feedback`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ content: "" });

    expect(res.statusCode).toBe(400);
  });
});

/** GET /events/:eventId/feedback => Get all feedback for an event */
describe("GET /events/:eventId/feedback", () => {
  test("Gets all feedback for an event", async () => {
    const res = await request(app).get(`/events/${eventId}/feedback`);

    expect(res.statusCode).toBe(200);
    expect(res.body.feedback).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          content: "Test feedback",
          eventId: eventId,
          userId: getUserId(),
        }),
      ])
    );
  });

  test("Returns empty array if no feedback exists", async () => {
    const res = await request(app).get(`/events/999/feedback`);
    expect(res.statusCode).toBe(200);
    expect(res.body.feedback).toEqual([]);
  });
});

/** PATCH /events/:eventId/feedback/:feedbackId => Update feedback */
describe("PATCH /events/:eventId/feedback/:feedbackId", () => {
  let feedbackId;

  beforeEach(async () => {
    const res = await request(app)
      .post(`/events/${eventId}/feedback`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ content: "Initial feedback" });

    feedbackId = res.body.feedback.id;
  });

  test("Allows user to update their feedback", async () => {
    const res = await request(app)
      .patch(`/events/${eventId}/feedback/${feedbackId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ content: "Updated feedback" });

    expect(res.statusCode).toBe(200);
    expect(res.body.feedback.content).toBe("Updated feedback");
  });

  test("Rejects update from unauthorized user", async () => {
    const res = await request(app)
      .patch(`/events/${eventId}/feedback/${feedbackId}`)
      .send({ content: "Unauthorize update" });

    expect(res.statusCode).toBe(401);
  });

  test("Rejects update with empty data", async () => {
    const res = await request(app)
      .patch(`/events/${eventId}/feedback/${feedbackId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ content: "" });

    expect(res.statusCode).toBe(400);
  });

  test("Returns 404 if feedback does not exist", async () => {
    const res = await request(app)
      .patch(`/events/${eventId}/feedback/99999`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ content: "Does not exist" });

    expect(res.statusCode).toBe(404);
  });
});

/** DELETE /events/:eventId/feedback/:feedbackId => Delete feedback */
describe("DELETE /events/:eventId/feedback/:feedbackId", () => {
  let feedbackId;

  beforeEach(async () => {
    const res = await request(app)
      .post(`/events/${eventId}/feedback`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ content: "To be deleted" });

    feedbackId = res.body.feedback.id;
  });

  test("Allows user to delete their feedback", async () => {
    const res = await request(app)
      .delete(`/events/${eventId}/feedback/${feedbackId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Feedback deleted successfully" });

    const check = await request(app).get(`/events/${eventId}/feedback`);
    expect(check.body.feedback).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: feedbackId })])
    );
  });

  test("Rejects delete from unauthorized user", async () => {
    const res = await request(app).delete(
      `/events/${eventId}/feedback/${feedbackId}`
    );

    expect(res.statusCode).toBe(401);
  });

  test("Returns 404 if feedback does not exist", async () => {
    const res = await request(app)
      .delete(`/events/${eventId}/feedback/99999`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(404);
  });
});
