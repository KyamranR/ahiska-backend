"use strict";

require("dotenv").config();
require("colors");

// Validate required environment variables
if (!process.env.SECRET_KEY) {
  console.error("Missing SECRET_KEY environment variable");
  process.exit(1);
}

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 5000;

function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///ahiskaDB_test"
    : process.env.DATABASE_URL || "postgresql:///ahiskaDB";
}

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Ahiska Config:".green);
if (process.env.NODE_ENV !== "production") {
  console.log("SECRET_KEY:".yellow, SECRET_KEY);
}

console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
