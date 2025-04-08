"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

class QAndA {
  // Create new question
  static async create({ question, askedBy }) {
    const result = await db.query(
      `INSERT INTO q_and_a (question, asked_by)
            VALUES ($1, $2)
            RETURNING id, question, answer, asked_by AS "askedBy", answered_by AS "answeredBy", created_at AS "createdAt", answered_at AS "answeredAt"`,
      [question, askedBy]
    );

    const createdQuestion = result.rows[0];

    const userRes = await db.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [askedBy]
    );

    createdQuestion.askedByFirstName = userRes.rows[0].first_name;
    createdQuestion.askedByLastName = userRes.rows[0].last_name;
    createdQuestion.answers = [];

    return createdQuestion;
  }

  // Answer a question
  static async answer(questionId, answerText, userId) {
    await db.query(
      `INSERT INTO answers (answer, question_id, answered_by)
       VALUES ($1, $2, $3)`,
      [answerText, questionId, userId]
    );

    // Get the question with asker info
    const questionRes = await db.query(
      `SELECT q.id,
              q.question,
              q.asked_by,
              u.first_name AS "askedByFirstName",
              u.last_name AS "askedByLastName"
       FROM q_and_a q
         JOIN users u ON q.asked_by = u.id
       WHERE q.id = $1`,
      [questionId]
    );

    const question = questionRes.rows[0];

    // Get all answers with user names
    const answersRes = await db.query(
      `SELECT a.id,
              a.answer,
              a.answered_by AS "answeredBy",
              a.answered_at AS "answeredAt",
              u.first_name AS "answeredByFirstName",
              u.last_name AS "answeredByLastName"
       FROM answers a
         JOIN users u ON a.answered_by = u.id
       WHERE a.question_id = $1
       ORDER BY a.answered_at ASC`,
      [questionId]
    );

    question.answers = answersRes.rows;

    return question.answers;
  }

  // Get all questions and answers
  static async getAll() {
    const questionsResult = await db.query(
      `SELECT q.id,
            q.question,
            q.asked_by AS "askedBy",
            q.created_at AS "createdAt",
            u.first_name AS "askedByFirstName",
            u.last_name AS "askedByLastName"
     FROM q_and_a q
     JOIN users u ON q.asked_by = u.id
       ORDER BY created_at DESC`
    );

    const questions = questionsResult.rows;

    for (let question of questions) {
      const answersResult = await db.query(
        `SELECT a.id,
              a.answer,
              a.answered_by AS "answeredBy",
              a.answered_at AS "answeredAt",
              u.first_name AS "answeredByFirstName",
              u.last_name AS "answeredByLastName"
       FROM answers a
       JOIN users u ON a.answered_by = u.id
       WHERE a.question_id = $1 ORDER BY answered_at ASC`,
        [question.id]
      );
      question.answers = answersResult.rows;
    }

    return questions;
  }

  // Get a question by ID
  static async getById(id) {
    const questionResult = await db.query(
      `SELECT id, question, asked_by AS "askedBy", created_at AS "createdAt"
       FROM q_and_a WHERE id = $1`,
      [id]
    );

    const question = questionResult.rows[0];
    if (!question) throw new NotFoundError(`No question found with ID: ${id}`);

    const answersResult = await db.query(
      `SELECT id, answer, answered_by AS "answeredBy", answered_at AS "answeredAt"
       FROM answers WHERE question_id = $1 ORDER BY answered_at ASC`,
      [id]
    );
    question.answers = answersResult.rows;

    return question;
  }

  // Delete a question
  static async delete(id) {
    const result = await db.query(
      `DELETE FROM q_and_a
        WHERE id = $1
        RETURNING id`,
      [id]
    );
    if (!result.rows[0]) {
      throw new NotFoundError(`No question found with ID: ${id}`);
    }

    return result.rows[0];
  }
}

module.exports = QAndA;
