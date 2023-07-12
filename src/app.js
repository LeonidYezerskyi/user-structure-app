const express = require("express");
const usersRouter = require("./routes/api/users");

require("dotenv").config();

const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.6gb55pn.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("Database connection successful!"));

const app = express();

app.use(express.json());

app.use("/api/users", usersRouter);

app.use((err, req, res, next) => {
  if (err?.error?.isJoi) {
    return res.status(400).json({
      type: err.type,
      message: err.error.toString(),
    });
  }

  if (err?.code === 11000) {
    return res.status(400).json({ message: "Duplicate key error" });
  }

  if (err) {
    return res.status(500).json({ message: "Internal server error" });
  }

  res.status(404).json({ message: "Not found" });
});

module.exports = app;
