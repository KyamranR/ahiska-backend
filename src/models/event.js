"user strict";

const db = require("../db");

class Event {
  // Create a new event
  static async create({ title, description, date, time, location, createdBy }) {
    const result = await db.query(
      `INSERT INTO events (title, description, event_date, event_time, location, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, title, description, event_date AS "date", event_time AS "time", location, created_by AS "createdBy"`,
      [title, description, date, time, location, createdBy]
    );
    return result.rows[0];
  }

  // Get event by ID
  static async getById(eventId) {
    const result = await db.query(
      `SELECT id, title, description, event_date AS "date", event_time AS "time", location, created_by AS "createdBy"
        FROM events
        WHERE id = $1`,
      [eventId]
    );
    return result.rows[0];
  }

  // Update an event
  static async update(eventId, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      event_date: "date",
      event_time: "time",
    });
    const eventIdIdx = "$" + (values.length + 1);

    const querySql = `UPDATE events
                      SET ${setCols}
                      WHERE id = ${eventIdIdx}
                      RETURNING id, title, description, event_date AS "date", event_time AS "time", location, created_by AS "createdBy"`;

    const result = await db.query(querySql, [...values, eventId]);
    return result.rows[0];
  }

  // Delete an event
  static async delete(eventId) {
    const result = await db.query(
      `DELETE FROM events WHERE id = $1 RETURNING id`,
      [eventId]
    );
    return result.rows[0];
  }
}

module.exports = Event;
