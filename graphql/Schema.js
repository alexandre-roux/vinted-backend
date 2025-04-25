const {buildSchema} = require("graphql");

const schema = buildSchema(`
    type Avatar {
        public_id: String!
        url: String!
    }

    type Account {
        username: String!
        phone: String
        avatar: Avatar
    }
    
    type User {
        _id: String!
        email: String!
        account: Account!
        token: String!
    }

    type Query {
        login(email: String!, password: String!): Account
    }
    
    type Mutation {
        signup(email: String!, username: String!, password: String!, phone: String, avatar: String): User
    }
`);

module.exports = schema;