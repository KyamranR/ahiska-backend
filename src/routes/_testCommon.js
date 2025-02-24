"use strict";

const db = require("../db");
const User = require("../models/user");
const Event = require("../models/event");
const Feedback = require("../models/feedback");
const QandA = require("../models/qAndA");
const { createToken } = require("../helper/tokens");

let adminToken;
let adminId;
let userId;
let eventId;
let questionId;

async function commonBeforeAll() {
  // Clear all tables
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM events");
  await db.query("DELETE FROM feedback");
  await db.query("DELETE FROM q_and_a");

  // Insert test admin and user
  const admin = await User.register({
    email: "admin@test.com",
    password: "adminpassword",
    firstName: "Admin",
    lastName: "LastAdmin",
    role: "admin",
  });

  adminToken = createToken(admin);
  adminId = admin.id;

  const user = await User.register({
    email: "user@test.com",
    password: "userpassword",
    firstName: "User",
    lastName: "Regular",
    role: "user",
  });

  userId = user.id;

  // Insert events
  const event = await Event.create({
    title: "Test Event",
    description: "Event for testing",
    date: "2025-02-15",
    time: "12:00:00",
    location: "Test Location",
    createdBy: adminId,
  });
  eventId = event.id;

  // Insert feedback
  await Feedback.create({
    content: "Test feedback",
    eventId: eventId,
    userId: userId,
  });

  // Insert question
  const question = await QandA.create({
    question: "Test question?",
    askedBy: userId,
  });
  questionId = question.id;
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

function getUserId() {
  return userId;
}

function getAdminId() {
  return adminId;
}

function getEventId() {
  return eventId;
}

function getAdminToken() {
  return adminToken;
}

function getQuestionId() {
  return questionId;
}
module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getEventId,
  getAdminId,
  getUserId,
  getAdminToken,
  getQuestionId,
};
