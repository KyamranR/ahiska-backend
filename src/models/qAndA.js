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
  static async answer(id, [answer, answeredBy]) {
    const result = await db.query(
      `UPDATE q_and_a
        SET answer = $1, answered_by = $2, answered_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, question, answer, asked_by AS "askedBy",
                    answered_by AS "answeredBy", created_at AS "createdAt",
                    answered_at AS "answeredAt"`,
      [answer, answeredBy, id]
    );
    return result.rows[0];
  }

  // Get all questions and answers
  static async getAll() {
    const result = await db.query(
      `SELECT id, question, answer, asked_by AS "askedBy",
                answered_by AS "answeredBy", created_at AS "createdAt",
                answered_at AS "answeredAt"
        FROM q_and_a
        ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // Get a question by ID
  static async getById(id) {
    const result = await db.query(
      `SELECT id, question, answer, asked_by AS "askedBy",
                answered_by AS "answeredBy", created_at AS "createdAt",
                answered_at AS "answeredAt"
        FROM q_and_a
        WHERE id = $1`,
      [id]
    );
    return result.rows[0];
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
