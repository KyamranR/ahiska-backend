"use strict";

const db = require("../db");
const Feedback = require("../models/feedback");
const { NotFoundError } = require("../expressError");
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

describe("Feedback Model", () => {
  let eventId, userId;

  beforeEach(async () => {
    const userResult = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, role)
       VALUES ('Test', 'User', 'testuser@example.com', 'password', 'user')
       RETURNING id`
    );
    userId = userResult.rows[0].id;

    const eventResult = await db.query(
      `INSERT INTO events (title, description, event_date, event_time, location, created_by)
       VALUES ('Test Event', 'Description', '2024-03-15', '10:00', 'Test Location', $1)
       RETURNING id`,
      [userId]
    );
    eventId = eventResult.rows[0].id;
  });

  describe("create()", () => {
    it("creates new feedback", async () => {
      const feedback = await Feedback.create({
        content: "Great event!",
        eventId,
        userId,
      });

      expect(feedback).toEqual({
        id: expect.any(Number),
        content: "Great event!",
        eventId,
        userId,
        createdAt: expect.any(Date),
      });

      const result = await db.query(`SELECT * FROM feedback WHERE id = $1`, [
        feedback.id,
      ]);
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].content).toBe("Great event!");
    });
  });

  describe("getById()", () => {
    it("retrieves feedback by ID", async () => {
      const feedback = await Feedback.create({
        content: "Great event!",
        eventId,
        userId,
      });

      const foundFeedback = await Feedback.getById(feedback.id);
      expect(foundFeedback).toEqual({
        id: feedback.id,
        content: feedback.content,
        eventId: feedback.eventId,
        userId: feedback.userId,
      });
    });

    it("throws NotFoundError if no feedback found", async () => {
      await expect(Feedback.getById(-1)).rejects.toThrow(NotFoundError);
    });
  });

  describe("getByEvent()", () => {
    it("retrieves all feedback for an event", async () => {
      await Feedback.create({ content: "Feedback 1", eventId, userId });
      await Feedback.create({ content: "Feedback 2", eventId, userId });

      const feedbackList = await Feedback.getByEvent(eventId);
      expect(feedbackList.length).toBe(2);
      expect(feedbackList[0]).toHaveProperty("content");
    });

    it("returns empty array if no feedback for the event", async () => {
      const feedbackList = await Feedback.getByEvent(-1);
      expect(feedbackList).toEqual([]);
    });
  });

  describe("update()", () => {
    it("updates feedback successfully", async () => {
      const feedback = await Feedback.create({
        content: "Old content",
        eventId,
        userId,
      });

      const updatedFeedback = await Feedback.update(
        feedback.id,
        { content: "Updated content" },
        { id: userId }
      );
      expect(updatedFeedback).toEqual({
        id: feedback.id,
        content: "Updated content",
        eventId: feedback.eventId,
        userId: feedback.userId,
        createdAt: expect.any(Date),
      });

      const result = await db.query(
        `SELECT content FROM feedback WHERE id = $1`,
        [feedback.id]
      );
      expect(result.rows[0].content).toBe("Updated content");
    });

    it("throws NotFoundError if feedback not found", async () => {
      await expect(
        Feedback.update(-1, { content: "Updated" }, { id: userId })
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError if user does not own feedback", async () => {
      const feedback = await Feedback.create({
        content: "Original",
        eventId,
        userId,
      });
      const wrongUserId = 999;

      await expect(
        Feedback.update(
          feedback.id,
          { content: "Hack attempt" },
          { id: wrongUserId }
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete()", () => {
    it("deletes feedback successfully", async () => {
      const feedback = await Feedback.create({
        content: "To be deleted",
        eventId,
        userId,
      });

      const success = await Feedback.delete(feedback.id);
      expect(success).toBe(true);

      const result = await db.query(`SELECT id FROM feedback WHERE id = $1`, [
        feedback.id,
      ]);
      expect(result.rows.length).toBe(0);
    });

    it("returns false if feedback does not exist", async () => {
      const success = await Feedback.delete(-1);
      expect(success).toBe(false);
    });
  });
});
