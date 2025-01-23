"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {
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

  // Delete a user
  static async delete(id) {
    const result = await db.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id`,
      [id]
    );
    if (!result.rows[0]) {
      throw new Error(`No user found with ID: ${id}`);
    }
    return result.rows[0];
  }
}

module.exports = User;
