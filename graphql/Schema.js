const {buildSchema} = require("graphql");

const schema = buildSchema(`
  type Avatar {
    public_id: String
    url: String
  }

  type Account {
    username: String!
    phone: String
    avatar: Avatar
  }

  type Query {
    login(email: String!, password: String!): Account
  }
`);

module.exports = schema;