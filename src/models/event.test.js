"use strict";

const db = require("../db");
const Event = require("../models/event");
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

describe("Event Model", () => {
  let eventData;

  beforeEach(() => {
    eventData = {
      title: "New Test Event",
      description: "New event description",
      date: "2024-03-20",
      time: "12:00",
      location: "Test Location",
      createdBy: global.user1Id,
    };
  });

  describe("create()", () => {
    it("creates a new event", async () => {
      const event = await Event.create(eventData);

      // Assert common event properties
      expect(event).toEqual({
        id: expect.any(Number),
        title: eventData.title,
        description: eventData.description,
        date: expect.anything(),
        time: expect.anything(),
        location: eventData.location,
        createdBy: global.user1Id,
      });

      // Ensure the event was actually inserted
      const result = await db.query(
        "SELECT title, description FROM events WHERE id = $1",
        [event.id]
      );
      expect(result.rows[0]).toEqual({
        title: "New Test Event",
        description: "New event description",
      });
    });
  });

  describe("getById()", () => {
    it("retrieves an event by ID", async () => {
      const existingEvent = await Event.create(eventData);
      const foundEvent = await Event.getById(existingEvent.id);

      expect(foundEvent).toEqual({
        id: existingEvent.id,
        title: eventData.title,
        description: eventData.description,
        date: expect.anything(),
        time: expect.anything(),
        location: eventData.location,
        createdBy: global.user1Id,
      });
    });

    it("returns null if no event found", async () => {
      const foundEvent = await Event.getById(-1);
      expect(foundEvent).toBeNull();
    });
  });

  describe("getAllEvents()", () => {
    it("retrieves all events", async () => {
      await Event.create(eventData);
      const allEvents = await Event.getAllEvents();

      expect(allEvents.length).toBeGreaterThanOrEqual(1);
      expect(allEvents[0]).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        date: expect.anything(),
        time: expect.anything(),
        location: expect.any(String),
        createdBy: expect.any(Number),
      });
    });
  });

  describe("update()", () => {
    it("updates an existing event", async () => {
      const event = await Event.create(eventData);
      const updatedData = {
        title: "Updated Event Title",
        description: "Updated description",
      };

      const updatedEvent = await Event.update(event.id, updatedData);

      expect(updatedEvent).toEqual({
        id: event.id,
        title: "Updated Event Title",
        description: "Updated description",
        date: expect.anything(),
        time: expect.anything(),
        location: eventData.location,
        createdBy: global.user1Id,
      });

      // Ensure the update was actually performed
      const result = await db.query(
        "SELECT title, description FROM events WHERE id = $1",
        [event.id]
      );
      expect(result.rows[0]).toEqual({
        title: "Updated Event Title",
        description: "Updated description",
      });
    });

    it("returns not found if event does not exist", async () => {
      await expect(Event.update(-1, { title: "No Event" })).rejects.toThrow(
        "Not Found"
      );
    });
  });

  describe("delete()", () => {
    it("deletes an event by ID", async () => {
      const event = await Event.create(eventData);
      const deletedEvent = await Event.delete(event.id);

      expect(deletedEvent).toEqual({ id: event.id });

      // Ensure the event was actually deleted
      const result = await db.query("SELECT id FROM events WHERE id = $1", [
        event.id,
      ]);
      expect(result.rows.length).toBe(0);
    });

    it("returns not found if event does not exist", async () => {
      await expect(Event.delete(-1)).rejects.toThrow("Event not found.");
    });
  });
});
