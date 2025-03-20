const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { app, server } = require("../server"); // Adjust this based on where your Express app is initialized

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
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  // Close mongoose connection
  await mongoose.connection.close();

  // Stop the in-memory MongoDB server
  await mongoServer.stop();

  // Close the Express server
  if (server) server.close();
});

describe("User API Integration Tests", () => {
  it("Should register a new user", async () => {
    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("Should not register user with existing email", async () => {
    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("Should login a registered user", async () => {
    await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    });

    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "password123"
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("Should not login with incorrect password", async () => {
    await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123"
    });

    const res = await request(app).post("/api/users/login").send({
      email: "test@example.com",
      password: "wrongpassword"
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
