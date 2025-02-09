"use strict";

const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const jsonschema = require("jsonschema");
const userSignupSchema = require("../schemas/userSignupSchema.json");
const { BadRequestError } = require("../expressError");
const { createToken } = require("../helper/tokens");

/** Register a new user: POST /auth/register */
router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userSignupSchema);
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

/** Authenticate a user: POST /auth/login */
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

/** Log out user: POST /auth/logout */
router.post("/logout", (req, res, next) => {
  try {
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
