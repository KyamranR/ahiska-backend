"use strict";

const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdateSchema.json");
const userSignupSchema = require("../schemas/userSignupSchema.json");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Register a new user: POST /users/register */
router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userSignupSchema);

    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errors);
    }

    const user = await User.register(req.body);
    return res.status(201).json({ user });
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

/** Update user info: PATCH /users/:id */
router.patch(
  "/:id",
  ensureLoggedIn,
  ensureCorrectUser,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errors = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errors);
      }

      const updatedUser = await User.update(req.params.id, req.body);
      return res.status(200).json({ user: updatedUser });
    } catch (err) {
      return next(err);
    }
  }
);

/** Change user password: PATCH /users/:id/password */
router.patch(
  "/:id/password",
  ensureLoggedIn,
  ensureCorrectUser,
  async (req, res, next) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        throw new BadRequestError(
          "Password is required and must be at least 6 characters long."
        );
      }

      const updatedUser = await User.changePassword(req.params.id, newPassword);

      return res.status(200).json({
        message: "Password updated successfully.",
        userId: updatedUser.id,
      });
    } catch (err) {
      return next(err);
    }
  }
);

/** Delete a user: DELETE /users/:id */
router.delete(
  "/:id",
  ensureLoggedIn,
  ensureCorrectUser,
  async (req, res, next) => {
    try {
      await User.delete(req.params.id);
      return res.status(200).json({ message: "User deleted successfully." });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
