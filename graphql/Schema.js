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

  type User {
    id: ID!
    email: String!
    account: Account!
    token: String!
    hash: String!
    salt: String!
  }

  type Query {
    login(email: String!, password: String): User
    # getUser(id: ID!): User #
    # getUsers: [User] #
  }

  type Mutation {
    signUp(email: String!, password: String!, username: String!, phone: String): User
    # updateUser(id: ID!, email: String, username: String, phone: String, password: String): User #
    # deleteUser(id: ID!): User #
  }
`);

module.exports = schema;