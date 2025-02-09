"use strict";

const express = require("express");
const Feedback = require("../models/feedback");
const router = express.Router({ mergeParams: true });
const { ensureLoggedIn } = require("../middleware/auth");
const jsonschema = require("jsonschema");
const feedbackSchema = require("../schemas/feedbackSchema.json");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Add feedback: POST /events/:eventId/feedback */
router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, feedbackSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errors);
    }

    const feedback = await Feedback.create({
      ...req.body,
      eventId: req.params.eventId,
      userId: req.user.id,
    });

    return res.status(201).json({ feedback });
  } catch (error) {
    return next(error);
  }
});

/** Get all feedback for an event: GET /events/:eventId/feedback */
router.get("/", async (req, res, next) => {
  try {
    const feedback = await Feedback.getByEvent(req.params.eventId);
    return res.status(200).json({ feedback });
  } catch (error) {
    return next(error);
  }
});

/** Update feedback: PATCH /events/:eventId/feedback/:feedbackId */
router.patch("/:feedbackId", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, feedbackSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errors);
    }

    const feedback = await Feedback.update(
      req.params.feedbackId,
      req.body,
      req.user
    );
    return res.status(200).json({ feedback });
  } catch (error) {
    return next(error);
  }
});

/** Delete feedback: DELETE /events/:eventId/feedback/:feedbackId */
router.delete("/:feedbackId", ensureLoggedIn, async (req, res, next) => {
  try {
    await Feedback.delete(req.params.feedbackId, req.user);
    return res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
