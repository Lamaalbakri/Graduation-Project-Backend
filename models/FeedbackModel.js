const mongoose = require("mongoose"); // Import the mongoose library
const { customAlphabet } = require("nanoid"); // Import customAlphabet function from nanoid for generating unique IDs
const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"; // Define an alphabet of numbers and lowercase letters for ID generation
const nanoid = customAlphabet(alphabet, 8); // Create an ID generator with a length of 8 characters

// Define the feedback schema
const feedbackSchema = new mongoose.Schema(
  {
    shortId: { // Short unique ID for the feedback
      type: String,
      unique: true, // Ensure each shortId is unique
      default: () => `f${nanoid()}`, // Generate a default value with prefix 'f' and nanoid
      immutable: true, // Make shortId immutable after creation
    },
    order_id: { // Store the associated order ID
      type: String,
      trim: true, // Remove whitespace around the value
    },
    from_id: { // Store the ID of the user who gives feedback
      type: mongoose.Schema.Types.ObjectId, // Set data type to ObjectId
      required: true, // Make field required
      ref: "Manufacturers", // Reference to the Manufacturers collection
    },
    to_id: { // Store the ID of the user receiving the feedback
      type: mongoose.Schema.Types.ObjectId, // Set data type to ObjectId
      required: true, // Make field required
      ref: "Suppliers", // Reference to the Suppliers collection
    },
    rating: { // Store the feedback rating
      type: Number,
      trim: true, // Trim any surrounding whitespace
      min: 0, // Set minimum value for rating
    },
    comment: { // Store the feedback comment
      type: String,
      required: true, // Make field required
    },
  },
  { timestamps: true } // Enable timestamps for createdAt and updatedAt fields
);

// Create the feedback model
const FeedbackModel = mongoose.model("Feedback", feedbackSchema);

module.exports = FeedbackModel; // Export the feedback model
