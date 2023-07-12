const express = require("express");
const Joi = require("joi");
const {
  signUp,
  authenticateUser,
  getUsers,
  changeUserBoss,
  isAuthorized,
} = require("../../controllers/users.controller");

const usersRouter = express.Router();
const tryCatch = require("../../utils/try-catch.util");

const schemaAddUser = Joi.object(
  {
    name: Joi.string()
      .regex(/^[\p{L}]+\s[\p{L}]+$/u)
      .required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
    password: Joi.string().min(6).alphanum().required(),
    role: Joi.string().required(),
    bossName: Joi.string().when("role", {
      is: Joi.not("administrator"),
      then: Joi.string()
        .regex(/^[\p{L}]+\s[\p{L}]+$/u)
        .required(),
      otherwise: Joi.string().allow("", null),
    }),
  },
  { allowUnknown: false }
);

const schemaAuthUser = Joi.object(
  {
    email: Joi.string()
      .email({
        minDomainSegments: 2,
      })
      .required(),
    password: Joi.string().min(6).alphanum().required(),
  },
  { allowUnknown: false }
);

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Missing required name field" });
    }
    next();
  };
};

usersRouter.post("/register", validateBody(schemaAddUser), tryCatch(signUp));
usersRouter.post(
  "/authenticate",
  validateBody(schemaAuthUser),
  tryCatch(authenticateUser)
);
usersRouter.get("/users", tryCatch(getUsers));
usersRouter.patch("/:id/boss", isAuthorized, tryCatch(changeUserBoss));

module.exports = usersRouter;
