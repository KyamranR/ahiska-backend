"use strict";

const db = require("../db");
const Registration = require("../models/registration");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Registration Model", () => {
  describe("register()", () => {
    it("registers a user for an event", async () => {
      const result = await Registration.register(global.event2, global.user1Id);

      expect(result).toEqual({
        id: expect.any(Number),
        eventId: global.event2,
        userId: global.user1Id,
      });

      const dbCheck = await db.query(
        "SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2",
        [global.event2, global.user1Id]
      );
      expect(dbCheck.rows.length).toBe(1);
    });
  });

  describe("getByEvent()", () => {
    it("gets all users registered for an event", async () => {
      const result = await Registration.getByEvent(global.event1);

      expect(result).toEqual([
        {
          id: expect.any(Number),
          eventId: global.event1,
          userId: global.user1Id,
          firstName: "Test",
          lastName: "User",
          email: "test1@example.com",
        },
      ]);
    });

    it("returns an empty array if no users registered", async () => {
      const result = await Registration.getByEvent(global.event2);
      expect(result).toEqual([]);
    });
  });

  describe("getByUser()", () => {
    it("gets all events that a user registered for", async () => {
      const result = await Registration.getByUser(global.user1Id);

      expect(result).toEqual([
        {
          id: expect.any(Number),
          eventId: global.event1,
          userId: global.user1Id,
          eventTitle: "Test Event 1",
          eventDate: expect.anything(),
        },
      ]);
    });

    it("returns an empty array if user has no registrations", async () => {
      const result = await Registration.getByUser(global.user2Id);
      expect(result).toEqual([]);
    });
  });

  describe("unregister()", () => {
    it("unregisters a user from an event", async () => {
      const result = await Registration.unregister(
        global.event1,
        global.user1Id
      );
      expect(result).toBe(true);

      const dbCheck = await db.query(
        "SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2",
        [global.event1, global.user1Id]
      );
      expect(dbCheck.rows.length).toBe(0);
    });

    it("returns false if the registration does not exist", async () => {
      const result = await Registration.unregister(
        global.event2,
        global.user1Id
      );
      expect(result).toBe(false);
    });
  });
});
