"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

class Feedback {
  // Create new feedback
  static async create({ content, eventId, userId }) {
    const result = await db.query(
      `INSERT INTO feedback (content, event_id, user_id)
            VALUES ($1, $2, $3)
            RETURNING id, content, event_id AS "eventId", user_id AS "userId", created_at AS "createdAt"`,
      [content, eventId, userId]
    );
    return result.rows[0];
  }

  // Get feedback by ID
  static async getById(feedbackId) {
    const result = await db.query(
      `SELECT id, content, event_id AS "eventId", user_id AS "userId"\
       FROM feedback
       WHERE id = $1`,
      [feedbackId]
    );

    const feedback = result.rows[0];
    if (!feedback) throw new NotFoundError(`Feedback not found: ${feedbackId}`);
    return feedback;
  }

  // Get all feedback for an event
  static async getByEvent(eventId) {
    const result = await db.query(
      `SELECT f.id, f.event_id AS "eventId", f.user_id AS "userId", u.first_name AS "firstName", u.last_name AS "lastName",
              f.content, f.created_at AS "createdAt"
       FROM feedback f
       JOIN users u ON f.user_id = u.id
       WHERE f.event_id = $1
       ORDER BY f.created_at DESC`,
      [eventId]
    );
    return result.rows;
  }

  /** Update feedback */
  static async update(feedbackId, { content }, user) {
    const result = await db.query(
      `UPDATE feedback
       SET content = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, event_id AS "eventId", user_id AS "userId", content, created_at AS "createdAt"`,
      [content, feedbackId, user.id]
    );

    if (!result.rows[0])
      throw new NotFoundError(`Feedback not found: ${feedbackId}`);
    return result.rows[0];
  }

  // Delete feedback by ID
  static async delete(id) {
    const result = await db.query(
      `DELETE FROM feedback
            WHERE id = $1
            RETURNING id`,
      [id]
    );
    return result.rows.length > 0;
  }
}

module.exports = Feedback;
