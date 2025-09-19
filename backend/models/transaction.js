const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        txnId: { type: String, required: true, unique: true },
        type: { type: String, enum: ["income", "expense"], required: true },
        amount: { type: Number, required: true },
        description: { type: String },
        donor: { type: String },
        date: { type: String, required: true }, // store ISO date string 'YYYY-MM-DD'
        timestamp: { type: Number, required: true },
        author: { type: mongoose.SchemaTypes.ObjectId, ref: "User", required: false }, // if you want per-user transactions
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema, "transactions");
