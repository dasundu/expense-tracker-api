const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const { app, server } = require("../server"); // Adjust this based on where your Express app is initialized
const Goal = require("../models/Goal");

let mongoServer;
let userToken;
let createdGoalRes;

// Before all tests, set up the in-memory database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.disconnect();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Register user and get the token
  const userRes = await request(app).post("/api/users/register").send({
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  });
  
  userToken = userRes.body.token;

  // Create a goal to test updating functionality
  const newGoal = {
    title: "Save for Home Renovation",
    targetAmount: 15000,
    deadline: "2025-12-31",
    autoAllocate: true,
  };

  createdGoalRes = await request(app)
    .post("/api/goals")
    .set("Authorization", `Bearer ${userToken}`)
    .send(newGoal);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  if (server) server.close();
});

describe("Goal API Integration Tests", () => {
  it("Should add a new goal", async () => {
    const newGoal = {
      title: "Save for Car Purchase",
      targetAmount: 20000,
      deadline: "2026-05-30",
      autoAllocate: false,
    };

    const res = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${userToken}`)
      .send(newGoal);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(newGoal.title);
    expect(res.body.targetAmount).toBe(newGoal.targetAmount);
  });

  it("Should not add a goal without authorization", async () => {
    const newGoal = {
      title: "Save for Vacation",
      targetAmount: 5000,
      deadline: "2024-06-01",
      autoAllocate: true,
    };

    const res = await request(app)
      .post("/api/goals")
      .send(newGoal);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token");
  });

  it("Should update a goal", async () => {
    const updatedGoal = {
      title: "Save for Home Renovation - Updated",
      targetAmount: 16000,
    };

    const res = await request(app)
      .put(`/api/goals/${createdGoalRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updatedGoal);

    console.log(res.body); // Debug logging to inspect the response

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updatedGoal.title);
    expect(res.body.targetAmount).toBe(updatedGoal.targetAmount);

    // Also validate the goal update in the database
    const updatedGoalFromDb = await Goal.findById(createdGoalRes.body._id);
    expect(updatedGoalFromDb.title).toBe(updatedGoal.title);
    expect(updatedGoalFromDb.targetAmount).toBe(updatedGoal.targetAmount);
  });

  it("Should delete a goal", async () => {
    const res = await request(app)
      .delete(`/api/goals/${createdGoalRes.body._id}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Goal deleted successfully");
  });
});
