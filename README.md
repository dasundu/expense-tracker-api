# Expense Tracker Backend

A robust backend service for an expense tracking application that helps users manage their finances, track expenses, set budgets, and achieve financial goals.

## Features

- **User Authentication**: Secure registration and login system with JWT
- **Transaction Management**: Create, read, update, and delete financial transactions
- **Budget Planning**: Set and manage budgets with status tracking
- **Financial Goals**: Set and track progress towards financial objectives
- **Notifications**: System for alerting users about budgets and goals
- **Performance Optimized**: Designed to handle multiple concurrent users

## Tech Stack

- **Node.js**: JavaScript runtime for server-side code
- **Express.js**: Web framework for building RESTful APIs
- **MongoDB**: NoSQL database for storing user and financial data
- **JWT**: JSON Web Tokens for secure authentication
- **Mongoose**: ODM library for MongoDB and Node.js

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (v4.4 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker-api.git
   cd expense-tracker-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_URI=mongodb+srv://expense_admin:finance123@cluster0.mongodb.net/expense-tracker
   # Or for local MongoDB
   # DB_URI=mongodb://localhost:27017/expense-tracker
   
   # Server Configuration
   PORT=5000
   
   # Authentication
   JWT_SECRET=expense_tracker_secret_key
   
   # Optional - for MongoDB Atlas
   MONGODB_USERNAME=expense_admin
   MONGODB_PASSWORD=finance123
   ```

   > **Note:** The database credentials above are examples only. In a production environment, use strong, unique credentials and keep them confidential.

4. **Start the server**
   ```bash
   npm start
   ```
   For development with automatic reloading:
   ```bash
   npm run dev
   ```

## API Documentation

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/users/register` | Register a new user | No |
| POST | `/api/users/login` | Login a user | No |
| GET | `/api/users/profile` | Get user profile | Yes |

### Transaction Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/transactions` | Add a new transaction | Yes |
| GET | `/api/transactions` | Get all transactions | Yes |
| PUT | `/api/transactions/:id` | Update a transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete a transaction | Yes |

### Budget Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/budgets` | Create a new budget | Yes |
| GET | `/api/budgets` | Get all budgets | Yes |
| PUT | `/api/budgets/:id` | Update a budget | Yes |
| DELETE | `/api/budgets/:id` | Delete a budget | Yes |
| GET | `/api/budgets/status` | Check budget status | Yes |
| GET | `/api/budgets/suggest-adjustment` | Get budget adjustment suggestions | Yes |

### Goal Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/goals` | Add a financial goal | Yes |
| GET | `/api/goals` | Get all goals | Yes |
| PUT | `/api/goals/:id` | Update a goal | Yes |
| DELETE | `/api/goals/:id` | Delete a goal | Yes |
| GET | `/api/goals/reminders` | Check goal reminders | Yes |

### Notification Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/notifications` | Get all notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark notification as read | Yes |
| PUT | `/api/notifications/read` | Mark all notifications as read | Yes |
| DELETE | `/api/notifications/:id` | Delete a notification | Yes |
| DELETE | `/api/notifications` | Delete all notifications | Yes |

## MongoDB Setup

### Local MongoDB
If you're using a local MongoDB instance:
1. Ensure MongoDB is running on your machine
2. Use the connection string: `mongodb://localhost:27017/expense-tracker`

### MongoDB Atlas
If you prefer using MongoDB Atlas (cloud):
1. Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Under Security > Database Access, create a user with the following credentials:
   - Username: `expense_admin`
   - Password: `finance123`
4. Under Security > Network Access, add your IP address
5. Under Clusters, click "Connect" and select "Connect your application"
6. Copy the connection string and replace `<username>`, `<password>`, and `<dbname>` with your credentials and database name

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. When logging in, users receive a token that should be included in the `Authorization` header of subsequent requests:

```
Authorization: Bearer <token>
```

## Data Models

### User

```javascript
{
  name: String,
  email: String,
  password: String,
  createdAt: Date
}
```

### Transaction

```javascript
{
  user: ObjectId,
  amount: Number,
  type: String, // "expense" or "income"
  category: String,
  description: String,
  date: Date
}
```

### Budget

```javascript
{
  user: ObjectId,
  category: String,
  amount: Number,
  startDate: Date,
  endDate: Date,
  currentSpending: Number
}
```

### Goal

```javascript
{
  user: ObjectId,
  name: String,
  targetAmount: Number,
  currentAmount: Number,
  deadline: Date,
  autoAllocate: Boolean
}
```

### Notification

```javascript
{
  user: ObjectId,
  type: String,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

## Performance Testing

To test the API's performance under load:

1. Install Artillery globally:
   ```bash
   npm install -g artillery
   ```

2. Run the performance test:
   ```bash
   artillery run load-test.yml
   ```

## Error Handling

The API returns standard HTTP status codes along with error messages in JSON format:

```json
{
  "error": "Error message description"
}
```

## Development

- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Deployment

For production deployment, consider:

1. Setting up a production MongoDB database
2. Using environment variables for sensitive information
3. Implementing a process manager like PM2
4. Setting up HTTPS with a valid SSL certificate

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
