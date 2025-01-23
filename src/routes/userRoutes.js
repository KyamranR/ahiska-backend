"use strict";

const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError, NotFoundError } = require("../expressError");
const { createToken } = require("../helper/tokens");

/** Register a new user: POST /users/register */
router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errors);
    }

    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    return res.status(201).json({ user: newUser, token });
  } catch (err) {
    return next(err);
  }
});

/** Authenticate a user: POST /users/login */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required.");
    }

    const user = await User.authenticate(email, password);
    const token = createToken(user);
    return res.status(200).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** Get user by ID: GET /users/:id */
router.get(
  "/:id",
  ensureLoggedIn,
  ensureCorrectUser,
  async (req, res, next) => {
    try {
      const user = await User.getById(req.params.id);

      if (!user) {
        throw new NotFoundError(`User not found: ${req.params.id}`);
      }

      return res.status(200).json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
