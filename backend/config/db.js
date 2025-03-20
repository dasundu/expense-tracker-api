// config/db.js
const mongoose = require("mongoose");

const connectDB = async (dbURI) => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("Already connected to MongoDB.");
      return;
    }

    console.log(`Attempting to connect to MongoDB at URI: ${dbURI}`);
    const conn = await mongoose.connect(dbURI); // Removed deprecated options

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);

    // Log detailed information during connection errors for better debugging
    if (process.env.NODE_ENV !== "test") {
      console.error("Failed to connect to the database. Exiting process.");
      process.exit(1); // Exit process with failure if not in test mode
    }
  }
};

module.exports = connectDB;
