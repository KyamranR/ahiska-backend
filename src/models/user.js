"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { sqlForPartialUpdate } = require("../helper/sql");

class User {
  // Register new user
  static async register({
    firstName,
    lastName,
    email,
    password,
    role,
    bio,
    profilePic,
  }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, bio, profile_pic)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, first_name AS "firstName", last_name AS "lastName", email, role, bio, profile_pic AS "profilePic"
            `,
      [firstName, lastName, email, hashedPassword, role, bio, profilePic]
    );

    return result.rows[0];
  }

  // Authenticate the user
  static async authenticate(email, password) {
    const result = await db.query(
      `SELECT id, email, password, first_name AS "firstName", last_name AS "lastName", role, bio, profile_pic AS "profilePic"
            FROM users
            WHERE email=$1
            `,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password; // Remove password before returning
        return user;
      }
    }

    throw new Error("Invalid email/password.");
  }

  // Get user by ID
  static async getById(id) {
    const result = await db.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, bio, profile_pic AS "profilePic"
            FROM users
            WHERE id = $1
            `,
      [id]
    );

    return result.rows[0];
  }

  // Update user info
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      profilePic: "profile_pic",
    });

    const idVarIdx = "$" + (values.length + 1);

    const query = `
        UPDATE users
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING id, first_name AS "firstName", last_name AS "lastName", email, role, bio, profile_pic AS "profilePic"`;

    const result = await db.query(query, [...values, id]);

    if (!result.rows[0]) {
      throw new Error(`No user found with ID: ${id}`);
    }

    return result.rows[0];
  }

  // Delete a user
  static async delete(id) {
    const result = await db.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    const user = result.rows[0];
    if (!user) {
      const error = new Error(`No user found with id: ${id}`);
      error.status = 404;
      throw error;
    }
    return user;
  }

  // Change user password
  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `UPDATE users
       SET password = $1
       WHERE id = $2
       RETURNING id`,
      [hashedPassword, id]
    );

    if (!result.rows[0]) {
      throw new Error(`No user found with ID: ${id}`);
    }
    return result.rows[0];
  }

  // Get all users (admin only)
  static async getAll() {
    const result = await db.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, bio, profile_pic AS "profilePic"
       FROM users`
    );
    return result.rows;
  }

  // Search users (admin only)
  static async search(user) {
    const result = await db.query(
      `SELECT id, first_name AS "firstName", last_name AS "lastName", email, role, bio, profile_pic AS "profilePic"
       FROM users
       WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR CONCAT(first_name, ' ', last_name) ILIKE $1 OR email ILIKE $1`,
      [`%${user}%`]
    );
    return result.rows;
  }

  // Update user role
  static async updateRole(id, role) {
    const result = await db.query(
      `UPDATE users
     SET role = $1
     WHERE id = $2
     RETURNING id, first_name AS "firstName", last_name AS "lastName", email, role, bio, profile_pic AS "profilePic"`,
      [role, id]
    );

    return result.rows[0];
  }
}

module.exports = User;
