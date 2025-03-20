const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { app, server } = require("../server"); // Adjust the path if necessary
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // Assuming you have a User model

let mongoServer;
let userToken;

beforeAll(async () => {
  // Start an in-memory MongoDB server for tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Disconnect previous connections
  await mongoose.disconnect();

  // Connect to the in-memory MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a test user and authenticate to get the token
  const userRes = await request(app).post("/api/users/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });

  userToken = userRes.body.token; // Save the token for use in subsequent tests
});

afterAll(async () => {
  // Close mongoose connection
  await mongoose.connection.close();

  // Stop the in-memory MongoDB server
  await mongoServer.stop();

  // Close the Express server
  if (server) server.close();
});

describe("Budget API Integration Tests", () => {
  it("Should create a new budget", async () => {
    const newBudget = {
      category: "Food",
      amount: 500,
      month: "March",
      notifyThreshold: 0.8,
    };

    const res = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newBudget);

    expect(res.status).toBe(201);
    expect(res.body.category).toBe(newBudget.category);
    expect(res.body.amount).toBe(newBudget.amount);
    expect(res.body.notifyThreshold).toBe(newBudget.notifyThreshold);
  });

  it("Should not create a budget without authorization", async () => {
    const newBudget = {
      category: "Food",
      amount: 500,
      month: "March",
      notifyThreshold: 0.8,
    };

    const res = await request(app)
      .post("/api/budgets")
      .send(newBudget);

    expect(res.status).toBe(401); // Unauthorized error
    expect(res.body.message).toBe("Not authorized, no token");
  });

  it("Should get all budgets for the user", async () => {
    // First, create a budget
    const newBudget = {
      category: "Entertainment",
      amount: 200,
      month: "March",
      notifyThreshold: 0.9,
    };

    await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newBudget);

    // Now fetch all budgets
    const res = await request(app)
      .get("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // Should return at least one budget
  });

  it("Should update a budget", async () => {
    // First, create a budget
    const newBudget = {
      category: "Food",
      amount: 500,
      month: "March",
      notifyThreshold: 0.8,
    };

    const createdBudgetRes = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newBudget);

    const updatedBudget = {
      amount: 600,
      notifyThreshold: 0.7,
    };

    const res = await request(app)
      .put(`/api/budgets/${createdBudgetRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updatedBudget);

    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(updatedBudget.amount);
    expect(res.body.notifyThreshold).toBe(updatedBudget.notifyThreshold);
  });

  it("Should not update a budget without authorization", async () => {
    const newBudget = {
      category: "Food",
      amount: 500,
      month: "March",
      notifyThreshold: 0.8,
    };

    const createdBudgetRes = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newBudget);

    const updatedBudget = {
      amount: 600,
    };

    const res = await request(app)
      .put(`/api/budgets/${createdBudgetRes.body._id}`)
      .send(updatedBudget);

    expect(res.status).toBe(401); // Unauthorized error
  });

  it("Should delete a budget", async () => {
    const newBudget = {
      category: "Food",
      amount: 500,
      month: "March",
      notifyThreshold: 0.8,
    };

    const createdBudgetRes = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newBudget);

    const res = await request(app)
      .delete(`/api/budgets/${createdBudgetRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Budget deleted successfully");
  });
});
