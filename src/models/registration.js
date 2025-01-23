"use strict";

const db = require("../db");

class Registration {
  // User registers for an event
  static async register(eventId, userId) {
    const result = await db.query(
      `INSERT INTO registrations (event_id, user_id)
            VALUES ($1, $2)
            RETURNING id, event_id AS "eventId", user_id AS "userId"`,
      [eventId, userId]
    );
    return result.rows[0];
  }

  // Get all users that registered for the event
  static async getByEvent(eventId) {
    const result = await db.query(
      `SELECT r.id, r.event_id AS "eventId", r.user_id AS "userId", 
                    u.first_name AS "firstName", u.last_name AS "lastName", u.email
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.event_id = $1
            ORDER BY u.last_name, u.first_name`,
      [eventId]
    );
    return result.rows;
  }

  // Get all events that a user registered
  static async getByUser(userId) {
    const result = await db.query(
      `SELECT r.id, r.event_id AS "eventId", r.user_id AS "userId", e.title AS "eventTitle", e.date AS "eventDate"
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = $1
            ORDER BY e.date`,
      [userId]
    );
    return result.rows;
  }

  // Remove user from registered event
  static async unregister(eventId, userId) {
    const result = await db.query(
      `DELETE FROM registrations
            WHERE event_id = $1 AND user_id = $2
            RETURNING id`,
      [eventId, userId]
    );
    return result.rows.length > 0;
  }
}

module.exports = Registration;
