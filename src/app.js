const express = require("express");
const cors = require("cors");
const app = express();

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const qAndARoutes = require("./routes/qAndARoutes");

const { NotFoundError } = require("./expressError");
const { handleErrors } = require("./middleware/errorHandlers");

app.use(cors());
app.use(express.json()); // Parse JSON requests

app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/q_and_a", qAndARoutes);
app.use("/events", eventRoutes);
app.use("/events/:eventId/feedback", feedbackRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new NotFoundError("Route not found"));
});

// Global error handler
app.use(handleErrors);

module.exports = app;
