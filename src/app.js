const express = require("express");
const usersRouter = require("./routes/users");

const mongoose = require("mongoose");

require("dotenv").config();

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.6gb55pn.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("Database connection successful!"));

const app = express();

app.use(express.json());

app.use("/api/users", usersRouter);

module.exports = app;
