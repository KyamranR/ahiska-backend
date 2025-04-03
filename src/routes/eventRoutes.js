"use strict";

const express = require("express");
const Event = require("../models/event");
const router = express.Router();
const {
  ensureLoggedIn,
  ensureAdmin,
  authenticateJWT,
} = require("../middleware/auth");
const jsonschema = require("jsonschema");
const eventSchema = require("../schemas/eventSchema.json");
const partialEventSchema = require("../schemas/partialEventSchema.json");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Create a new event: POST /events */
router.post("/", authenticateJWT, ensureAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, eventSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errors);
    }

    const requestBody = {
      title: req.body.title,
      description: req.body.description,
      event_date: req.body.event_date,
      event_time: req.body.event_time,
      location: req.body.location,
      createdBy: req.body.created_by,
    };
    const newEvent = await Event.create(requestBody);

    return res.status(201).json({ event: newEvent });
  } catch (error) {
    return next(error);
  }
});

/** Get all events: GET /events */
router.get("/", async (req, res, next) => {
  try {
    const events = await Event.getAllEvents();
    return res.status(200).json({ events });
  } catch (error) {
    return next(error);
  }
});

/** Get event by ID: GET /events/:id */
router.get("/:id", async (req, res, next) => {
  try {
    const event = await Event.getById(req.params.id);
    if (!event) throw new NotFoundError(`Event not found: ${req.params.id}`);

    return res.status(200).json({ event });
  } catch (error) {
    return next(error);
  }
});

/** Update event: PATCH /events/:id */
router.patch(
  "/:id",
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, partialEventSchema);
      if (!validator.valid) {
        const errors = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errors);
      }

      const updatedEvent = await Event.update(req.params.id, req.body);
      return res.status(200).json({ event: updatedEvent });
    } catch (error) {
      return next(error);
    }
  }
);

/** Delete event: DELETE /events/:id */
router.delete(
  "/:id",
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      await Event.delete(req.params.id);
      return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
