const request = require("supertest");
const { app, server } = require("../server"); // Import app and server
const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const jwt = require("jsonwebtoken");

describe("GET /api/reports (Financial Report)", () => {
  let user, token;

  beforeAll(async () => {
    // Connect to the test database
    process.env.MONGO_URI = process.env.MONGO_TEST_URI;
    await mongoose.connect(process.env.MONGO_TEST_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create test user
    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword", // Replace with a pre-hashed password
    });

    // Generate JWT token
    token = "Bearer " + jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Insert test transactions
    await Transaction.insertMany([
      { user: user._id, amount: 1000, category: "Salary", type: "income", date: new Date("2025-03-01"), tags: ["job"] },
      { user: user._id, amount: 200, category: "Food", type: "expense", date: new Date("2025-03-02"), tags: ["groceries"] },
      { user: user._id, amount: 500, category: "Investment", type: "income", date: new Date("2025-03-03"), tags: ["stocks"] },
      { user: user._id, amount: 300, category: "Entertainment", type: "expense", date: new Date("2025-03-04"), tags: ["movies"] },
    ]);
  });

  afterAll(async () => {
    // Cleanup database after tests
    await User.deleteMany();
    await Transaction.deleteMany();
    await mongoose.connection.close();
    if (server) {
      server.close(); // Close server after tests, only if server is initialized
    }
  });

  it("should return financial report with correct summary and trends", async () => {
    const res = await request(app)
      .get("/api/reports?startDate=2025-03-01&endDate=2025-03-04") // Filter by date range
      .set("Authorization", token)
      .expect(200);

    expect(res.body).toHaveProperty("summary");
    expect(res.body.summary.totalIncome).toBe(1500); // 1000 (Salary) + 500 (Investment)
    expect(res.body.summary.totalExpenses).toBe(500); // 200 (Food) + 300 (Entertainment)

    expect(res.body).toHaveProperty("trends");
    expect(res.body.trends).toMatchObject({
      "2025-03-01": { income: 1000, expenses: 0 },
      "2025-03-02": { income: 0, expenses: 200 },
      "2025-03-03": { income: 500, expenses: 0 },
      "2025-03-04": { income: 0, expenses: 300 },
    });

    expect(res.body).toHaveProperty("transactions");
    expect(res.body.transactions.length).toBe(4);
  });

  it("should return filtered transactions when category is specified", async () => {
    const res = await request(app)
      .get("/api/reports?category=Food")
      .set("Authorization", token)
      .expect(200);

    expect(res.body.transactions.length).toBe(1);
    expect(res.body.transactions[0].category).toBe("Food");
  });

  it("should return filtered transactions when tags are specified", async () => {
    const res = await request(app)
      .get("/api/reports?tags=stocks")
      .set("Authorization", token)
      .expect(200);

    expect(res.body.transactions.length).toBe(1);
    expect(res.body.transactions[0].tags).toContain("stocks");
  });
});
