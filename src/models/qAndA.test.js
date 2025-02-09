"use strict";

const db = require("../db");
const QAndA = require("../models/qAndA");
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

describe("QAndA Model", () => {
  describe("create()", () => {
    it("creates a new question", async () => {
      const questionData = {
        question: "What is JavaScript?",
        askedBy: global.user1Id,
      };
      const result = await QAndA.create(questionData);

      expect(result).toEqual({
        id: expect.any(Number),
        question: "What is JavaScript?",
        answer: null,
        askedBy: global.user1Id,
        answeredBy: null,
        createAt: expect.any(Date),
        answeredAt: null,
      });

      const dbCheck = await db.query("SELECT * FROM q_and_a WHERE id = $1", [
        result.id,
      ]);
      expect(dbCheck.rows.length).toBe(1);
    });
  });

  describe("answer()", () => {
    it("answers a question", async () => {
      const question = await QAndA.create({
        question: "What is SQL?",
        askedBy: global.user1Id,
      });

      const result = await QAndA.answer(question.id, [
        "Structured Query Language",
        global.user2Id,
      ]);
      expect(result).toEqual({
        id: question.id,
        question: "What is SQL?",
        answer: "Structured Query Language",
        askedBy: global.user1Id,
        answeredBy: global.user2Id,
        createdAt: expect.any(Date),
        answeredAt: expect.any(Date),
      });

      const dbCheck = await db.query("SELECT * FROM q_and_a WHERE id = $1", [
        question.id,
      ]);
      expect(dbCheck.rows[0].answer).toBe("Structured Query Language");
    });
  });

  describe("getAll()", () => {
    it("gets all questions", async () => {
      const result = await QAndA.getAll();
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty("question");
      expect(result[0]).toHaveProperty("createdAt");
    });
  });

  describe("getById()", () => {
    it("gets a question by ID", async () => {
      const question = await QAndA.create({
        question: "What is Docker?",
        askedBy: global.user1Id,
      });

      const result = await QAndA.getById(question.id);
      expect(result).toEqual({
        id: question.id,
        question: "What is Docker?",
        answer: null,
        askedBy: global.user1Id,
        answeredBy: null,
        createdAt: expect.any(Date),
        answeredAt: null,
      });
    });

    it("returns undefined if question is not found", async () => {
      const result = await QAndA.getById(-1);
      expect(result).toBeUndefined();
    });
  });

  describe("delete()", () => {
    it("deletes a question by ID", async () => {
      const question = await QAndA.create({
        question: "What is Kubernetes?",
        askedBy: global.user1Id,
      });

      const result = await QAndA.delete(question.id);
      expect(result).toEqual({ id: question.id });

      const dbCheck = await db.query("SELECT * FROM q_and_a WHERE id = $1", [
        question.id,
      ]);
      expect(dbCheck.rows.length).toBe(0);
    });

    it("throws an error if question ID does not exist", async () => {
      await expect(QAndA.delete(-1)).rejects.toThrow(
        "No question found with ID: -1"
      );
    });
  });
});
