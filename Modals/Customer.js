const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    packages: [
      {
        packageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Package",
          required: true,
        },
        remainingRedemptions: { type: Number, required: true },
        expiration: { type: Date, required: false },
        assignedDate: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["unused", "active", "redeemed", "expired"], // Track the package state
          default: "unused",
        }, // New status field to categorize the package
      },
    ],
    punchHistory: [
      {
        packageId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Package",
          required: true,
        },
        bedId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Bed",
          required: true,
        },
        date: { type: Date, default: Date.now },
        consentForm: {
          signedAt: { type: Date, default: Date.now },
          signature: { type: String, required: true }, // Can be a base64 string (for images) or text
          signatureType: { type: String, default: "text" }, // Field to store signature type: 'text' or 'image'
        },
      },
    ],
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
