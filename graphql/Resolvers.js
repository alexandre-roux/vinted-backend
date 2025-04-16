const {SHA256} = require("crypto-js");
const User = require("../models/User");
const {loginSchema} = require("../validators/users");

const resolvers = {
    login: async ({email, password}) => {

        const {error, value} = loginSchema.validate({email, password});
        if (error) {
            throw new Error(error.details[0].message);
        }

        try {
            const user = await User.findOne({email: email});
            if (!user) {
                throw new Error("User not found.");
            }

            const hash = SHA256(password + user.salt).toString();
            if (hash !== user.hash) {
                throw new Error("Unauthorized: invalid password.");
            }

            return user.account
        } catch (err) {
            throw new Error(err.message);
        }
    },
};

module.exports = resolvers;