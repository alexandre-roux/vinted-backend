const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const {createHandler} = require('graphql-http/lib/use/express');
const schema = require("./graphql/Schema");
const resolvers = require("./graphql/Resolvers");

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
});

app.use(
    "/graphql",
    createHandler({
        schema,
        rootValue: resolvers,
        context: (req) => ({req}),
        graphiql: true,
    })
);

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
