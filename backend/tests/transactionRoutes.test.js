const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { app, server } = require("../server"); // Adjust this based on where your Express app is initialized
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const Budget = require("../models/Budget");

let mongoServer;

beforeAll(async () => {
  // Start an in-memory MongoDB server for tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Ensure no previous connections are active
  await mongoose.disconnect();

  // Connect to the in-memory MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
},10000);

afterAll(async () => {
  // Close mongoose connection
  await mongoose.connection.close();

  // Stop the in-memory MongoDB server
  await mongoServer.stop();

  // Close the Express server
  if (server) server.close();
});

describe("Transaction API Integration Tests", () => {
  let userToken;
  
  // Before each test, create a user and authenticate to get the token
  beforeAll(async () => {
    const userRes = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    userToken = userRes.body.token; // Save the token for use in subsequent tests
  });

  it("Should add a new transaction", async () => {
    const newTransaction = {
      amount: 100,
      category: "Food",
      type: "expense",
      notes: "Lunch",
      tags: ["groceries"],
    };

    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newTransaction);

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(newTransaction.amount);
    expect(res.body.category).toBe(newTransaction.category);
  });

  it("Should not add a transaction without authorization", async () => {
    const newTransaction = {
      amount: 100,
      category: "Food",
      type: "expense",
      notes: "Lunch",
      tags: ["groceries"],
    };
  
    const res = await request(app)
      .post("/api/transactions")
      .send(newTransaction);
  
    expect(res.status).toBe(401); // Unauthorized error
    expect(res.body.message).toBe("Not authorized, no token"); // Update this line
  });
  
  

  it("Should get all transactions for the user", async () => {
    // First, add a transaction
    const newTransaction = {
      amount: 50,
      category: "Entertainment",
      type: "expense",
      notes: "Movie",
      tags: ["leisure"],
    };

    await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newTransaction);

    // Now fetch all transactions
    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // Should return at least one transaction
  });

  it("Should update a transaction", async () => {
    const newTransaction = {
      amount: 100,
      category: "Food",
      type: "expense",
      notes: "Lunch",
      tags: ["groceries"],
    };

    const createdTransactionRes = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newTransaction);

    const updatedTransaction = {
      amount: 150,
      category: "Food",
      type: "expense",
      notes: "Dinner",
      tags: ["groceries", "dining"],
    };

    const res = await request(app)
      .put(`/api/transactions/${createdTransactionRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updatedTransaction);

    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(updatedTransaction.amount);
    expect(res.body.notes).toBe(updatedTransaction.notes);
  });

  it("Should delete a transaction", async () => {
    const newTransaction = {
      amount: 100,
      category: "Food",
      type: "expense",
      notes: "Lunch",
      tags: ["groceries"],
    };

    const createdTransactionRes = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newTransaction);

    const res = await request(app)
      .delete(`/api/transactions/${createdTransactionRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Transaction deleted successfully");
  });
});
