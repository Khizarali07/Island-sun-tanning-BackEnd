# Island Sun Tanning - Back-End

This is the back-end service for the Island Sun Tanning web application. It provides a RESTful API to manage customers, tanning beds, packages, and administrative functions.

## Features

- **Admin Management:** Secure endpoints for administrative actions.
- **Customer Management:** CRUD operations for customer data, including enrollment and tracking.
- **Tanning Bed Management:** API to manage the status and details of tanning beds.
- **Package Management:** Endpoints for creating, updating, and deleting tanning packages.
- **Authentication:** JWT-based authentication to secure the API.
- **Password Reset:** Functionality for users to reset their passwords via email.

## Technologies Used

- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web framework for Node.js.
- **MongoDB:** NoSQL database for storing application data.
- **Mongoose:** ODM library for MongoDB and Node.js.
- **JSON Web Token (JWT):** For secure user authentication.
- **bcryptjs:** For hashing passwords.
- **Nodemailer:** For sending emails (e.g., password reset).
- **CORS:** To enable Cross-Origin Resource Sharing.
- **dotenv:** For managing environment variables.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- MongoDB instance (local or cloud-based like MongoDB Atlas).

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd back-end
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `config.env` file in the `back-end` root directory and add the following variables:

    ```
    PORT=5000
    MONGO_URI=<Your_MongoDB_Connection_String>
    JWT_SECRET=<Your_JWT_Secret>
    JWT_EXPIRES_IN=90d
    EMAIL_HOST=<Your_Email_Host>
    EMAIL_PORT=<Your_Email_Port>
    EMAIL_USER=<Your_Email_Username>
    EMAIL_PASS=<Your_Email_Password>
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:5000`.

## API Endpoints

The API is structured into the following routes:

- `/api/admins`: Admin-related endpoints.
- `/api/customers`: Customer-related endpoints.
- `/api/beds`: Tanning bed-related endpoints.
- `/api/packages`: Tanning package-related endpoints.

For detailed information on each endpoint, please refer to the route files in the `Routes/` directory.
