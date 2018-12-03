const Joi = require("joi");

module.exports = Joi.object().keys({
  name: Joi.string()
    .min(2)
    .max(30)
    .required(),
  phone: Joi.string()
    .min(5)
    .max(15)
    .required(),
  password: Joi.string()
    .min(6)
    .required(),
  password2: Joi.string()
    .min(6)
    .required()
    .valid(Joi.ref("password")),
  email: Joi.string()
    .email()
    .required()
});
