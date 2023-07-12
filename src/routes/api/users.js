const express = require("express");
const {
  signUp,
  authenticateUser,
  getUsers,
  changeUserBoss,
  isAuthorized,
} = require("../../controllers/users.controller");

const {
  schemaAddUser,
  schemaAuthUser,
} = require("../../validation/user.validation");

const usersRouter = express.Router();
const tryCatch = require("../../utils/try-catch.util");

const validator = require("express-joi-validation").createValidator({
  passError: true,
});

usersRouter.post("/register", validator.body(schemaAddUser), tryCatch(signUp));
usersRouter.post(
  "/authenticate",
  validator.body(schemaAuthUser),
  tryCatch(authenticateUser)
);
usersRouter.get("/users", tryCatch(getUsers));
usersRouter.patch("/:id/boss", isAuthorized, tryCatch(changeUserBoss));

module.exports = usersRouter;
