const express = require("express");
const {
  signUp,
  authenticateUser,
  getUsers,
  changeUserBoss,
} = require("../controllers/users.controller");

const usersRouter = express.Router();
const tryCatch = require("../utils/try-catch.util");

usersRouter.post("/register", tryCatch(signUp));
usersRouter.post("/authenticate", tryCatch(authenticateUser));
usersRouter.get("/users", tryCatch(getUsers));
usersRouter.patch("/:id", tryCatch(changeUserBoss));

module.exports = usersRouter;
