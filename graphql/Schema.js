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

    type ProductDetail {
        brand: String
        size: String
        condition: String
        color: String
        city: String
    }

    type ProductImage {
        public_id: String
        url: String
    }

    type Offer {
        _id: String!
        product_name: String!
        product_description: String!
        product_price: Float!
        product_details: ProductDetail
        product_image: ProductImage
        owner: User
    }

    type Query {
        login(email: String!, password: String!): Account
        offers(title: String, priceMin: Float, priceMax: Float, sort: String, page: Int): [Offer]
        offer(id: String!): Offer
    }

    type Mutation {
        signup(email: String!, username: String!, password: String!, phone: String, avatar: String): User
        createOffer(title: String!, description: String!, price: Float!, brand: String, size: String, condition: String, color: String, city: String, picture: String): Offer
        updateOffer(id: String!, title: String, description: String, price: Float, brand: String, size: String, condition: String, color: String, city: String, picture: String): Offer
        deleteOffer(id: String!): String
    }
`);

module.exports = schema;
