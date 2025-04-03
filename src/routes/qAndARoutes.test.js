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
  getAdminToken,
  getEventId,
  getUserId,
  getQuestionId,
} = require("./_testCommon");
const { answer } = require("../models/qAndA");
let questionId;
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** POST /q_and_a => Create new question */
describe("POST /q_and_a", () => {
  test("Allow logged-in user to create a question", async () => {
    const res = await request(app)
      .post("/q_and_a")
      .set("Authorization", `Bearer ${getAdminToken()}`)
      .send({ question: "What is coding?" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      question: expect.objectContaining({
        id: expect.any(Number),
        question: "What is coding?",
        askedBy: getAdminId(),
        createdAt: expect.anything(),
        answer: null,
        answeredAt: null,
        answeredBy: null,
      }),
    });
    questionId = res.body.question.id;
  });

  test("Rejects unauthenticated user", async () => {
    const res = await request(app)
      .post("/q_and_a")
      .send({ question: "Why is the sky blue?" });
    expect(res.statusCode).toBe(401);
  });

  test("Rejects request with missing question", async () => {
    const res = await request(app)
      .post("/q_and_a")
      .set("Authorization", `Bearer ${getAdminToken()}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });
});

/** PATCH /q_and_a/:id/answer => Answer a question */
describe("PATCH /q_and_a/:id/answer", () => {
  test("Allows logged-in user to answer a question", async () => {
    const questionRes = await request(app)
      .post("/q_and_a")
      .set("Authorization", `Bearer ${getAdminToken()}`)
      .send({ question: "What is 2+2?" });

    const questionId = questionRes.body.question.id;

    const res = await request(app)
      .patch(`/q_and_a/${questionId}/answer`)
      .set("Authorization", `Bearer ${getAdminToken()}`)
      .send({ answer: "4" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      answers: expect.objectContaining({
        answer: "4",
        answeredBy: expect.any(Number),
        answeredAt: expect.any(String),
        id: expect.any(Number),
      }),
    });
  });

  test("Rejects answering a non-existent question", async () => {
    const res = await request(app)
      .patch(`/q_and_a/9999/answer`)
      .set("Authorization", `Bearer ${getAdminToken()}`)
      .send({ answer: "This should fail" });

    expect(res.statusCode).toBe(404);
  });

  test("Rejects answering with empty answer", async () => {
    const res = await request(app)
      .patch(`/q_and_a/${questionId}/answer`)
      .set("Authorization", `Bearer ${getAdminToken()}`)
      .send({ answer: "" });

    expect(res.statusCode).toBe(400);
  });

  test("Rejects unauthorized user", async () => {
    const res = await request(app)
      .patch(`/q_and_a/${questionId}/answer`)
      .send({ answer: "Unauthorized answer" });

    expect(res.statusCode).toBe(401);
  });
});

/** GET /q_and_a => Get all question */
describe("GET /q_and_a", () => {
  test("Gets all questions", async () => {
    const res = await request(app).get("/q_and_a");

    expect(res.statusCode).toBe(200);
    expect(res.body.questions).toBeInstanceOf(Array);
    expect(res.body.questions.length).toBeGreaterThan(0);
  });
});

/** GET /q_and_a/:id => Get a specific question */
describe("GET /q_and_a/:id", () => {
  test("Retrieves a specific question", async () => {
    const res = await request(app).get(`/q_and_a/${getQuestionId()}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.question).toEqual(
      expect.objectContaining({
        id: getQuestionId(),
        question: "Test question?",
        askedBy: expect.any(Number),
        createdAt: expect.any(String),
        answers: expect.any(Array),
      })
    );
  });

  test("Return 404 if question does not exist", async () => {
    const res = await request(app).get("/q_and_a/9999");

    expect(res.statusCode).toBe(404);
  });
});

/** DELETE /q_and_a/:id => Delete a question */
describe("DELETE /q_and_a/:id", () => {
  test("Allow logged-in user to delete a question", async () => {
    const questionRes = await request(app)
      .post("/q_and_a")
      .set("Authorization", `Bearer ${getAdminToken()}`)
      .send({ question: "How to code?" });

    const qId = questionRes.body.question.id;

    const res = await request(app)
      .delete(`/q_and_a/${qId}`)
      .set("Authorization", `Bearer ${getAdminToken()}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Question deleted.", id: { id: qId } });
  });

  test("Return 404 if question does not exist", async () => {
    const res = await request(app)
      .delete("/q_and_a/9999")
      .set("Authorization", `Bearer ${getAdminToken()}`);

    expect(res.statusCode).toBe(404);
  });

  test("Reject unauthenticated user", async () => {
    const res = await request(app).delete(`/q_and_a/${getQuestionId()}`);

    expect(res.statusCode).toBe(401);
  });
});
