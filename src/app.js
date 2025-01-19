const express = require("express");
const cors = require("cors");

const app = express();
const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(express.json()); // Parse JSON requests

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/users", userRoutes);

module.exports = app;
