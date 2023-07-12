const express = require("express");
const usersRouter = require("./routes/api/users");
const { expressErrorHandler } = require("./utils/expressErrorHandler");
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

app.use(expressErrorHandler);

module.exports = app;
