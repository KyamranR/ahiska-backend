"use strict";

const express = require("express");
const Registration = require("../models/registration");
const router = express.Router({ mergeParams: true });
const { ensureLoggedIn, authenticateJWT } = require("../middleware/auth");
const { NotFoundError } = require("../expressError");

/** Register a user for an event: POST /events/:eventId/register */
router.post("/", authenticateJWT, ensureLoggedIn, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = res.locals.user.id;

    const registration = await Registration.register(eventId, userId);
    return res.status(201).json({ registration });
  } catch (error) {
    return next(error);
  }
});

/** Unregister a user from an event: DELETE /events/:eventId/register */
router.delete("/", authenticateJWT, ensureLoggedIn, async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = res.locals.user.id;

    const success = await Registration.unregister(eventId, userId);
    if (!success) throw new NotFoundError("Registration not found");

    return res.status(200).json({ message: "Successfully unregistered" });
  } catch (error) {
    return next(error);
  }
});

/** Get all users registered for an event: GET /events/:eventId/registrations */
router.get("/", async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.getByEvent(eventId);

    return res.status(200).json({ registrations });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
