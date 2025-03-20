const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  convertedAmount: { type: Number }, // amount converted to base currency (e.g., USD)
  currency: { type: String, default: "USD" }, // user-selected currency
  type: { type: String, enum: ["income", "expense"], required: true },
  category: {
    type: String,
    enum: [
      "Food",
      "Transportation",
      "Entertainment",
      "Utilities",
      "Health",
      "Shopping",
      "Education",
      "Investment",
      "Salary",
      "Rent",
      'Groceries',
      "Other",
    ],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  tags: [String], // Array of custom tags like #vacation, #bills
});

module.exports = mongoose.model("Transaction", transactionSchema);