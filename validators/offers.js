const Joi = require("joi");

const offerSchema = Joi.object({
    title: Joi.string().max(50).required(),
    description: Joi.string().max(500),
    price: Joi.number().positive().max(100000).required(),
    brand: Joi.string(),
    size: Joi.string(),
    condition: Joi.string(),
    color: Joi.string(),
    city: Joi.string(),
});

const offerUpdateSchema = Joi.object({
    title: Joi.string().max(50),
    description: Joi.string().max(500),
    price: Joi.number().positive().max(100000),
    brand: Joi.string().allow("", null),
    size: Joi.string().allow("", null),
    condition: Joi.string().allow("", null),
    color: Joi.string().allow("", null),
    city: Joi.string().allow("", null),
}).min(1);

module.exports = {
    offerSchema,
    offerUpdateSchema,
};
