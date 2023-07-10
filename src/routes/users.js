const express = require("express");
const { signUp } = require("../controllers/users.controller");

const usersRouter = express.Router();
const tryCatch = require("../utils/try-catch.util");

usersRouter.post("/register", tryCatch(signUp));

module.exports = usersRouter;
