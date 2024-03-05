const Joi = require("joi");

// register
const Schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  phone: Joi.number(),
  roles: Joi.array().items(Joi.string().valid("user", "admin")),
  token: Joi.string(),
});

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

const resetSchema = Joi.object({
  userId: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

// profile
const userSchema = Joi.object({
  userId: Joi.string(),
  name: Joi.string(),
  phone: Joi.number(),
});

const validate = (req, res, next) => {
  const { error } = Schema.validate(req.body);
  if (error) {
    res.status(400).json({ msg: error.details[0].message });
  } else {
    next();
  }
};

const resetValidation = (req, res, next) => {
  const { error } = resetSchema.validate(req.body);
  if (error) {
    res.status(400).json({ msg: error.details[0].message });
  } else {
    next();
  }
};

const loginValidation = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ msg: error.details[0].message });
  } else {
    next();
  }
};

const userValidation = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    res.status(400).json({ msg: error.details[0].message });
  } else {
    next();
  }
};

module.exports = { validate, resetValidation, loginValidation, userValidation };
