"use strict";

const User = require("../models/user");
const db = require("../db");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const bcrypt = require("bcrypt");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("User model", function () {
  it("can register a new user", async function () {
    const user = await User.register({
      firstName: "New",
      lastName: "User",
      email: "new@example.com",
      password: "password",
      role: "user",
      bio: "New bio",
      profilePic: "new.gif",
    });
    expect(user).toEqual({
      id: expect.any(Number),
      firstName: "New",
      lastName: "User",
      email: "new@example.com",
      role: "user",
      bio: "New bio",
      profilePic: "new.gif",
    });

    const result = await db.query(
      "SELECT email FROM users WHERE email = 'new@example.com'"
    );
    expect(result.rows[0]).toEqual({ email: "new@example.com" });
  });

  // Add more tests for other User model methods (authenticate, getById, update, delete, etc.)
  it("can authenticate a user", async function () {
    const user = await User.authenticate("test1@example.com", "password1");
    expect(user).toEqual({
      id: expect.any(Number),
      firstName: "Test",
      lastName: "User",
      email: "test1@example.com",
      role: "user",
      bio: "Test bio",
      profilePic: "test.jpg",
    });
  });

  it("throws error for incorrect password", async function () {
    await expect(
      User.authenticate("test1@example.com", "wrong")
    ).rejects.toThrowError("Invalid email/password.");
  });

  it("throws error for non-existent user", async function () {
    await expect(
      User.authenticate("nonexistent@example.com", "password")
    ).rejects.toThrowError("Invalid email/password.");
  });

  it("can get a user by ID", async function () {
    const user = await User.getById(global.user1Id);
    expect(user).toEqual({
      id: global.user1Id,
      firstName: "Test",
      lastName: "User",
      email: "test1@example.com",
      role: "user",
      bio: "Test bio",
      profilePic: "test.jpg",
    });
  });

  it("can update user information", async function () {
    const updatedUser = await User.update(global.user1Id, {
      firstName: "Updated",
      bio: "Updated bio",
    });
    expect(updatedUser).toEqual({
      id: global.user1Id,
      firstName: "Updated",
      lastName: "User",
      email: "test1@example.com",
      role: "user",
      bio: "Updated bio",
      profilePic: "test.jpg",
    });

    const result = await db.query(
      "SELECT first_name, bio FROM users WHERE id = $1",
      [global.user1Id]
    );
    expect(result.rows[0]).toEqual({
      first_name: "Updated",
      bio: "Updated bio",
    });
  });

  it("can delete a user", async function () {
    const deletedUser = await User.delete(user1Id);
    expect(deletedUser).toEqual({ id: user1Id });

    const result = await db.query("SELECT * FROM users WHERE id = 1");
    expect(result.rows.length).toBe(0);
  });

  it("can change user password", async function () {
    const changedPassword = await User.changePassword(
      global.user2Id,
      "newPassword"
    );
    expect(changedPassword).toEqual({ id: global.user2Id });

    const result = await db.query("SELECT password FROM users WHERE id = $1", [
      global.user2Id,
    ]);
    const isValid = await bcrypt.compare(
      "newPassword",
      result.rows[0].password
    );
    expect(isValid).toBe(true);
  });

  it("can get all users (admin only)", async function () {
    const users = await User.getAll();
    expect(users.length).toBe(2);
  });

  it("can search users (admin only)", async function () {
    const users = await User.search("Test");
    expect(users.length).toBe(1);
    expect(users[0].firstName).toBe("Test");
  });

  it("can update user role (admin only)", async function () {
    const updatedRole = await User.updateRole(global.user1Id, "admin");
    expect(updatedRole.role).toBe("admin");

    const result = await db.query("SELECT role FROM users WHERE id = $1", [
      global.user1Id,
    ]);
    expect(result.rows[0].role).toBe("admin");
  });
});
