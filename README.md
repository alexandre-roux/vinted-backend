# Project Name

This project is a web application built with Node.js and Express.js that allows users to manage offers and user accounts
for a marketplace for buying, selling, and exchanging clothes. It includes functionalities for user authentication,
offer creation, editing, deletion, and retrieval.

## Features

- User Signup and Login
- Offer Creation, Editing, Deletion, and Retrieval
- Image Upload using Cloudinary
- User Authentication Middleware

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Cloudinary for image storage
- Crypto-JS for password hashing
- UID2 for token generation

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your Cloudinary credentials:
    ```env
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_SECRET=your_api_secret
    ```

4. Start the server:
    ```bash
    npm start
    ```

## API Endpoints

### User Routes

- **POST** `/user/signup`
    - Create a new user account.
    - Request body should include `email`, `username`, `password`, and optionally `phone` and `picture`.

- **POST** `/user/login`
    - Login with an existing user account.
    - Request body should include `email` and `password`.

### Offer Routes

- **GET** `/offers`
    - Retrieve a list of offers with optional query parameters for filtering and sorting.
    - Query parameters: `title`, `priceMin`, `priceMax`, `sort`, `page`.

- **GET** `/offer/:offerId`
    - Retrieve a specific offer by its ID.

- **POST** `/offer/publish`
    - Create a new offer (requires authentication).
    - Request body should include `title`, `description`, `price`, `brand`, `size`, `condition`, `color`, `city`, and
      optionally `picture`.

- **PUT** `/offer/:offerId`
    - Edit an existing offer by its ID (requires authentication).
    - Request body can include `title`, `description`, `price`, and optionally `picture`.

- **DELETE** `/offer/:offerId`
    - Delete an offer by its ID (requires authentication).

## Middleware

- `isAuthenticated`: Middleware to check if the user is authenticated before allowing access to certain routes.

## Models

### User Model

- `email`: String, unique
- `account`: Object
    - `username`: String, required
    - `phone`: String
    - `avatar`: Object
- `token`: String
- `hash`: String
- `salt`: String

### Offer Model

- `product_name`: String, required
- `product_description`: String
- `product_price`: Number, required
- `product_details`: Array of Objects
- `product_image`: Object
- `owner`: ObjectId (reference to User)

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.