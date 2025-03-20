const request = require("supertest");
const { app, server } = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");
const Notification = require("../models/Notification");
const jwt = require("jsonwebtoken");

jest.setTimeout(30000); // ✅ Set Jest timeout globally before tests

describe("Notifications API Integration Tests", () => {
  let user, token, notificationId;

  beforeAll(async () => {
    console.log("🔄 Starting beforeAll hook...");
    const startTime = Date.now();

    if (!process.env.MONGO_TEST_URI) {
      throw new Error("❌ MONGO_TEST_URI is not defined in environment variables");
    }

    try {
      console.log("⏳ Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGO_TEST_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ MongoDB Connected! (Time taken: ${Date.now() - startTime}ms)`);
    } catch (error) {
      console.error("❌ Error connecting to MongoDB:", error);
      throw error;
    }

    // ✅ Create a test user
    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword123",
    });

    // ✅ Generate JWT token
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    if (!token) throw new Error("❌ Token generation failed!");
    console.log("✅ Generated Test Token:", token);

    // ✅ Insert a test notification
    const notification = await Notification.create({
      user: user._id,
      message: "Your spending exceeded the limit!",
      type: "Spending Alert",
    });

    notificationId = notification._id;
    console.log("✅ Created Notification ID:", notificationId);
  });

  // ✅ Test: Create a new notification
  it("should create a new notification", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "Bill due in 3 days!", type: "Bill Reminder" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Bill due in 3 days!");
    expect(res.body).toHaveProperty("type", "Bill Reminder");
    expect(res.body).toHaveProperty("isRead", false);
  });

  // ✅ Test: Get all notifications for a user
  it("should return all notifications for the user", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`);

    console.log("📩 Get Notifications Response:", res.body);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("message");
    expect(res.body[0]).toHaveProperty("type");
    expect(res.body[0]).toHaveProperty("isRead");
  });

  // ✅ Test: Mark a notification as read
  it("should mark a notification as read", async () => {
    console.log("🔹 Testing Mark as Read with ID:", notificationId);
  
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${token}`);
  
    console.log("✅ Mark as Read Response:", res.body);
  
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Notification marked as read");
    expect(res.body.notification.isRead).toBe(true);
  });

  // ✅ Test: Delete a notification
  it("should delete a notification", async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Notification deleted successfully");

    // ✅ Ensure the notification is actually deleted
    const checkNotification = await Notification.findById(notificationId);
    expect(checkNotification).toBeNull();
  });

  afterAll(async () => {
    console.log("🔄 Cleaning up test database...");
    await Notification.deleteMany();
    await User.deleteMany();
    
    console.log("⏳ Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed.");

    if (server) {
      console.log("⏳ Shutting down test server...");
      server.close(() => {
        console.log("✅ Server closed.");
      });
    }
  });
});
