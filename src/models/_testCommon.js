"use strict";

const db = require("../db");
const User = require("../models/user");
const Event = require("../models/event");
const Feedback = require("../models/feedback");
const QAndA = require("../models/qAndA");
const Registration = require("../models/registration");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  await db.query("DELETE FROM feedback");
  await db.query("DELETE FROM events");
  await db.query("DELETE FROM users");

  // Insert test users

  const user1 = await User.register({
    firstName: "Test",
    lastName: "User",
    email: "test1@example.com",
    password: "password1",
    role: "user",
    bio: "Test bio",
    profilePic: "test.jpg",
  });

  const user2 = await User.register({
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "password2",
    role: "admin",
    bio: "Admin bio",
    profilePic: "admin.png",
  });

  global.user1Id = user1.id;
  global.user2Id = user2.id;

  // Insert test events
  const event1 = await Event.create({
    title: "Test Event 1",
    description: "Test event description 1",
    date: "2024-03-15",
    time: "10:00",
    location: "Test Location 1",
    createdBy: user1.id,
  });

  const event2 = await Event.create({
    title: "Test Event 2",
    description: "Test event description 2",
    date: "2024-03-22",
    time: "14:00",
    location: "Test Location 2",
    createdBy: user2.id,
  });

  global.event1 = event1.id;
  global.event2 = event2.id;

  // Insert test feedback
  const feedback1 = await Feedback.create({
    content: "Great event!",
    eventId: event1.id,
    userId: user1.id,
  });

  // Insert test Q&A
  const qAndA1 = await QAndA.create({
    question: "When is the next event?",
    askedBy: user1.id,
  });

  // Insert test registrations
  const registration1 = await Registration.register(
    global.event1,
    global.user1Id
  );

  return { user1, user2, event1, event2, feedback1, qAndA1, registration1 };
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
