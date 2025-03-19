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
    return result.rows[0];
  }

  // Answer a question
  static async answer(questionId, answer, answeredBy) {
    await db.query(
      `INSERT INTO answers (question_id, answer, answered_by)
       VALUES ($1, $2, $3)`,
      [questionId, answer, answeredBy]
    );

    const answers = await db.query(
      `SELECT id, answer, answered_by AS "answeredBy", answered_at AS "answeredAt"
       FROM answers WHERE question_id = $1 ORDER BY answered_at ASC`,
      [questionId]
    );

    return answers.rows;
  }

  // Get all questions and answers
  static async getAll() {
    const questionsResult = await db.query(
      `SELECT id, question, asked_by AS "askedBy", created_at AS "createdAt"
       FROM q_and_a
       ORDER BY created_at DESC`
    );

    const questions = questionsResult.rows;

    for (let question of questions) {
      const answersResult = await db.query(
        `SELECT id, answer, answered_by AS "answeredBy", answered_at AS "answeredAt"
         FROM answers WHERE question_id = $1 ORDER BY answered_at ASC`,
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
