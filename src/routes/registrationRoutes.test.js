"use strict";

const request = require("supertest");
const app = require("../app");
const { createToken } = require("../helper/tokens");
const db = require("../db");

jest.mock("../models/registration");
const Registration = require("../models/registration");

const testUserIds = [1001, 1002];
const testEventIds = [2001, 2002];

let userToken;

beforeAll(() => {
  userToken = createToken({
    id: testUserIds[0],
    username: "user1",
    isAdmin: false,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await db.end();
});
describe("POST /events/:eventId/register", () => {
  test("successfully registers a user", async () => {
    Registration.register.mockResolvedValue({
      eventId: testEventIds[0],
      userId: testUserIds[0],
    });

    const resp = await request(app)
      .post(`/events/${testEventIds[0]}/register`)
      .set("authorization", `Bearer ${userToken}`);

    expect(resp.statusCode).toBe(201);
    expect(resp.body.registration).toEqual({
      eventId: testEventIds[0],
      userId: testUserIds[0],
    });
    expect(Registration.register).toHaveBeenCalledWith(
      String(testEventIds[0]),
      testUserIds[0]
    );
  });

  test("unauthorized without token", async () => {
    const resp = await request(app).post(`/events/${testEventIds[0]}/register`);
    expect(resp.statusCode).toBe(401);
  });
});

describe("DELETE /events/:eventId/register", () => {
  test("successfully unregisters a user", async () => {
    Registration.unregister.mockResolvedValue(true);

    const resp = await request(app)
      .delete(`/events/${testEventIds[0]}/register`)
      .set("authorization", `Bearer ${userToken}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ message: "Successfully unregistered" });
    expect(Registration.unregister).toHaveBeenCalledWith(
      String(testEventIds[0]),
      testUserIds[0]
    );
  });

  test("throws 404 if unregister fails", async () => {
    Registration.unregister.mockResolvedValue(false);

    const resp = await request(app)
      .delete(`/events/${testEventIds[0]}/register`)
      .set("authorization", `Bearer ${userToken}`);

    expect(resp.statusCode).toBe(404);
  });

  test("unauthorized without token", async () => {
    const resp = await request(app).delete(
      `/events/${testEventIds[0]}/register`
    );
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /events/:eventId/register", () => {
  test("returns list of users for an event", async () => {
    const mockRegistrations = [
      { userId: 1, username: "user1" },
      { userId: 2, username: "user2" },
    ];
    Registration.getByEvent.mockResolvedValue(mockRegistrations);

    const resp = await request(app).get(`/events/${testEventIds[0]}/register`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ registrations: mockRegistrations });
    expect(Registration.getByEvent).toHaveBeenCalledWith(
      String(testEventIds[0])
    );
  });

  test("handles errors properly", async () => {
    Registration.getByEvent.mockImplementation(() => {
      throw new Error("Something went wrong");
    });

    const resp = await request(app).get(`/events/${testEventIds[0]}/register`);
    expect(resp.statusCode).toBe(500);
  });
});
