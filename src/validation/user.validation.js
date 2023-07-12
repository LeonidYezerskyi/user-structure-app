const Joi = require("joi");

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
  { abortEarly: false, allowUnknown: false }
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
  { abortEarly: false, allowUnknown: false }
);

module.exports = { schemaAddUser, schemaAuthUser };
