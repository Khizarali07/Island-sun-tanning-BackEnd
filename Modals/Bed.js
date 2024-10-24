const mongoose = require("mongoose");

// Define the Bed schema
const bedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure bed names are unique
    },
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package", // Reference the Package model
        required: true,
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Bed model
const Bed = mongoose.model("Bed", bedSchema);

module.exports = Bed;
