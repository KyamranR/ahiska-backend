"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getAdminId,
  getEventId,
  getAdminToken,
} = require("./_testCommon");
const { createToken } = require("../helper/tokens");

let adminToken;
let eventId;

beforeAll(async () => {
  await commonBeforeAll();
  eventId = getEventId();
});

beforeEach(async () => {
  console.log("Admin token before request:", adminToken);
  await commonBeforeEach();
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "admin@test.com", password: "adminpassword" });
  console.log("login response:", loginRes.body);
  adminToken = loginRes.body.token;
  console.log("Updated Admin Token:", adminToken);
});
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /events", () => {
  it("should create a new event as an admin", async () => {
    const newEvent = {
      title: "New Test Event",
      description: "Description of new test event",
      event_date: "2025-03-10",
      event_time: "15:00:00",
      location: "New Test Location",
      created_by: getAdminId(),
    };
    console.log("GET ADMIN ID:", getAdminId());
    console.log("Sending token:", adminToken);
    const res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newEvent);
    console.log("Sent Authorization Header:", res.req._header);
    console.log("Response body:", res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.event).toHaveProperty("id");
    expect(res.body.event.title).toBe(newEvent.title);
  });

  it("should fail if not admin", async () => {
    const newEvent = {
      title: "Should Fail",
      description: "Should not create",
      date: "2025-03-10",
      time: "15:00",
      location: "No Location",
    };

    const res = await request(app).post("/events").send(newEvent);

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /events", () => {
  it("should get all events", async () => {
    const res = await request(app).get("/events");

    expect(res.statusCode).toBe(200);
    expect(res.body.events.length).toBeGreaterThanOrEqual(1);
    expect(res.body.events[0]).toHaveProperty("id");
  });
});

describe("GET /events/:id", () => {
  it("should get event by id", async () => {
    const res = await request(app).get(`/events/${eventId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.event).toHaveProperty("id");
    expect(res.body.event.id).toBe(eventId);
  });

  it("should return 404 if event not found", async () => {
    const res = await request(app).get("/events/999999");

    expect(res.statusCode).toBe(404);
  });
});

describe("PATCH /events/:id", () => {
  it("should update an event as admin", async () => {
    const updatedEvent = {
      title: "Updated Event Title",
    };

    const res = await request(app)
      .patch(`/events/${eventId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedEvent);

    expect(res.statusCode).toBe(200);
    expect(res.body.event.title).toBe(updatedEvent.title);
  });

  it("should fail to update if not admin", async () => {
    const updatedEvent = {
      title: "Should Not Update",
    };

    const res = await request(app)
      .patch(`/events/${eventId}`)
      .send(updatedEvent);

    expect(res.statusCode).toBe(401);
  });

  it("should return 404 for non-existing event", async () => {
    const updatedEvent = {
      title: "Non-existing Event",
    };

    const res = await request(app)
      .patch("/events/0")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedEvent);

    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /events/:id", () => {
  it("should delete an event as admin", async () => {
    const res = await request(app)
      .delete(`/events/${eventId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Event deleted successfully");
  });

  it("should fail to delete if not admin", async () => {
    const res = await request(app).delete(`/events/${eventId}`);

    expect(res.statusCode).toBe(401);
  });

  it("should return 404 for non-existing event", async () => {
    const res = await request(app)
      .delete("/events/123")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
