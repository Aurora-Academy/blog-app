const Joi = require("joi");

const Schema = Joi.object({
  title: Joi.string().required(),
  tags: [Joi.string()],
  content: Joi.string(),
  author: Joi.string().required(),
  words: Joi.number(),
  status: Joi.string(),
  image: Joi.string(),
});

const validate = (req, res, next) => {
  const { error } = Schema.validate(req.body);
  if (error) {
    res.status(400).json({ msg: error.details[0].message });
  } else {
    next();
  }
};

module.exports = { validate };
