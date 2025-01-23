"use strict";

const db = require("../db");

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

  // Get all feedback for an event
  static async getByEvent(eventId) {
    const result = await db.query(
      `SELECT id, content, event_id AS "eventId", user_id AS "userId", created_at AS "createdAt"
            FROM feedback
            WHERE event_id = $1
            ORDER BY created_at DESC`,
      [eventId]
    );
    return result.rows;
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
