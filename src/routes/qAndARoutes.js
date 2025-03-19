"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const QandA = require("../models/qAndA");
const qAndASchema = require("../schemas/qAndASchema.json");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError, NotFoundError } = require("../expressError");

const router = new express.Router();

/** Create a new question POST /q_and_a */
router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    req.body.askedBy = res.locals.user.id;
    const validator = jsonschema.validate(req.body, qAndASchema);

    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errors);
    }

    const { question } = req.body;

    const newQuestion = await QandA.create({
      question,
      askedBy: req.body.askedBy,
    });
    return res.status(201).json({ question: newQuestion });
  } catch (err) {
    return next(err);
  }
});

/** Answer a question PATCH /q_and_a/:id/answer */
router.patch("/:id/answer", ensureLoggedIn, async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer) throw new BadRequestError("Answer is required.");

    const id = req.params.id;
    const answeredBy = res.locals.user.id;

    const updatedAnswers = await QandA.answer(id, answer, answeredBy);
    if (!updatedAnswers) throw new NotFoundError(`Question not found: ${id}`);

    return res.status(200).json({ answers: updatedAnswers });
  } catch (err) {
    return next(err);
  }
});

/** Get all questions and answers GET /q_and_a */
router.get("/", async (req, res, next) => {
  try {
    const questions = await QandA.getAll();
    return res.status(200).json({ questions });
  } catch (err) {
    return next(err);
  }
});

/** Get a specific question GET /q_and_a/:id */
router.get("/:id", async (req, res, next) => {
  try {
    const question = await QandA.getById(req.params.id);
    if (!question)
      throw new NotFoundError(`Question not found: ${req.params.id}`);

    return res.status(200).json({ question });
  } catch (error) {
    return next(error);
  }
});

/** Delete a question DELETE /q_and_a/:id */
router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const deletedQuestion = await QandA.delete(req.params.id);
    return res
      .status(200)
      .json({ message: "Question deleted.", id: deletedQuestion });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
