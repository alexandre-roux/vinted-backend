const Joi = require("joi");

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().optional(),
    picture: Joi.object({
        path: Joi.string().required()
    }).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = {
    signupSchema,
    loginSchema,
};
