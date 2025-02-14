"use strict";

const express = require("express");
const User = require("../models/user");
const Event = require("../models/event");
const Feedback = require("../models/feedback");
const router = new express.Router();
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { NotFoundError, BadRequestError } = require("../expressError");

/** Admin-only: Get all users: GET /admin/users */
router.get("/users", ensureLoggedIn, ensureAdmin, async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
});

/** Search users by name or email: GET /users/search?query= */
router.get("/search", ensureLoggedIn, ensureAdmin, async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) {
      throw new BadRequestError("Search query is required.");
    }

    const users = await User.search(query);
    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
});

/** Admin-only: Delete a user by ID: DELETE /admin/users/:id */
router.delete(
  "/users/:id",
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      await User.delete(req.params.id);
      return res.status(200).json({ message: "User deleted successfully." });
    } catch (err) {
      return next(err);
    }
  }
);

/** Admin-only: Update user role: PATCH /admin/users/:id/role */
router.patch(
  "/users/:id/role",
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      const { role } = req.body;

      if (!role || !["admin", "user"].includes(role)) {
        throw new BadRequestError(
          "Invalid role. Allowed values: 'admin', 'user'."
        );
      }

      const updatedUser = await User.updateRole(req.params.id, role);

      if (!updatedUser) {
        throw new NotFoundError(`User with ID ${req.params.id} not found.`);
      }

      return res
        .status(200)
        .json({ message: `User role updated to ${role}.`, user: updatedUser });
    } catch (err) {
      return next(err);
    }
  }
);

/** Admin-only: Get all events: GET /admin/events */
router.get("/events", ensureLoggedIn, ensureAdmin, async (req, res, next) => {
  try {
    const events = await Event.getAllEvents();
    return res.status(200).json({ events });
  } catch (err) {
    return next(err);
  }
});

/** Admin-only: Delete an event by ID: DELETE /admin/events/:id */
router.delete(
  "/events/:id",
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      await Event.delete(req.params.id);
      return res.status(200).json({ message: "Event deleted successfully." });
    } catch (err) {
      return next(err);
    }
  }
);

/** Admin-only: Get all feedback: GET /admin/feedback/eventId */
router.get(
  "/feedback/:eventId",
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      const feedback = await Feedback.getByEvent(req.params.eventId);
      return res.status(200).json({ feedback });
    } catch (err) {
      return next(err);
    }
  }
);

/** Admin-only: Delete feedback by ID: DELETE /admin/feedback/:id */
router.delete(
  "/feedback/:id",
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      await Feedback.delete(req.params.id);
      return res
        .status(200)
        .json({ message: "Feedback deleted successfully." });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
