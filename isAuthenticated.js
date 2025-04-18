const User = require("./models/User");

const isAuthenticated = async (req, res, next) => {
    if (req.headers.authorization) {
        const user = await User.findOne({
            token: req.headers.authorization.replace("Bearer ", ""),
        });

        if (!user) {
            return res.status(401).json({error: "Unauthorized"});
        } else {
            req.user = user;
            // We create a "user" key in req. The route in which the middleware is called will have access to req.user
            return next();
        }
    } else {
        return res.status(401).json({error: "Unauthorized"});
    }
};

module.exports = isAuthenticated;
