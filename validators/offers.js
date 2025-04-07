const Joi = require("joi");

const offerCreateSchema = Joi.object({
    title: Joi.string().max(50).required(),
    description: Joi.string().max(500),
    price: Joi.number().positive().max(100000).required(),
    brand: Joi.string(),
    size: Joi.string(),
    condition: Joi.string(),
    color: Joi.string(),
    city: Joi.string(),
});

const offerGetSchema = Joi.object({
    title: Joi.string().max(50),
    priceMin: Joi.number().positive(),
    priceMax: Joi.number().positive(),
    sort: Joi.string().valid("price-desc", "price-asc"),
    page: Joi.number().integer().positive(),
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
    offerCreateSchema,
    offerGetSchema,
    offerUpdateSchema,
};
