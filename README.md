# Vinted Backend

This project is a backend API for a Vinted-like marketplace that allows users to manage offers and user accounts
for buying, selling, and exchanging clothes. It includes functionalities for user authentication,
offer creation, editing, deletion, and retrieval, as well as payment processing.

👉 The GraphQL API is available here: https://vinted-backend-qe6e.onrender.com/graphql

## Features

- User Signup and Login
- Offer Creation, Editing, Deletion, and Retrieval
- Image Upload using Cloudinary
- User Authentication Middleware
- Payment Processing with Stripe
- GraphQL API

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- GraphQL with graphql-http
- Cloudinary for image storage
- Crypto-JS for password hashing
- UID2 for token generation
- Joi for data validation
- Stripe for payment processing

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/vinted-backend.git
    cd vinted-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_SECRET=your_api_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

4. Start the server:
    ```bash
    npm start
    ```

5. Access GraphiQL (GraphQL IDE) at:
    ```
    http://localhost:3000/graphql
    ```

## GraphQL API

The GraphQL API is available at `/graphql` endpoint. You can use GraphiQL to explore and test the API.

### Queries

- **login(email: String!, password: String!): Account**
    - Authenticate a user and return their account information.

- **offers(title: String, priceMin: Float, priceMax: Float, sort: String, page: Int): [Offer]**
    - Retrieve a list of offers with optional filtering and pagination.

- **offer(id: String!): Offer**
    - Retrieve a specific offer by its ID.

### Mutations

- **signup(email: String!, username: String!, password: String!, phone: String, avatar: String): User**
    - Create a new user account.

- **createOffer(title: String!, description: String!, price: Float!, brand: String, size: String, condition: String,
  color: String, city: String, picture: String): Offer**
    - Create a new offer (requires authentication).

- **updateOffer(id: String!, title: String, description: String, price: Float, brand: String, size: String, condition:
  String, color: String, city: String, picture: String): Offer**
    - Update an existing offer (requires authentication).

- **deleteOffer(id: String!): String**
    - Delete an offer (requires authentication).

## Authentication

- `isAuthenticated`: Middleware to check if the user is authenticated before allowing access to protected operations.

## Models

### User Model

- `_id`: String, unique identifier
- `email`: String, unique
- `account`: Object
    - `username`: String, required
  - `phone`: String (optional)
  - `avatar`: Object (optional)
      - `public_id`: String
      - `url`: String
- `token`: String
- `hash`: String (password hash)
- `salt`: String (password salt)

### Offer Model

- `_id`: String, unique identifier
- `product_name`: String, required
- `product_description`: String, required
- `product_price`: Number, required
- `product_details`: Object
    - `brand`: String (optional)
    - `size`: String (optional)
    - `condition`: String (optional)
    - `color`: String (optional)
    - `city`: String (optional)
- `product_image`: Object (optional)
    - `public_id`: String
    - `url`: String
- `owner`: Reference to User model

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License as specified in the package.json file.
