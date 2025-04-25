const Joi = require("joi");

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().optional(),
    avatar: Joi.string().pattern(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = {
    signupSchema,
    loginSchema,
};
