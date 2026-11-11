
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://feedback-bu8h.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Feedback Schema
const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      trim: true,
      default: ""
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  { timestamps: true }
);

// Feedback Model
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Feedback Server Running",
    database: mongoose.connection.readyState === 1
      ? "MongoDB Atlas Connected"
      : "MongoDB Disconnected"
  });
});

// Database Status
app.get("/api/db-status", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    database: connected ? "Connected" : "Disconnected",
    databaseName: mongoose.connection.name || null
  });
});

// Submit Feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, subject, message, rating } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required"
      });
    }

    const feedback = await Feedback.create({
      name: name.trim(),
      email: email.trim(),
      subject: typeof subject === "string" ? subject.trim() : "",
      message: message.trim(),
      rating: rating === undefined ? 5 : Number(rating)
    });

    res.status(201).json({
      success: true,
      message: "Feedback saved successfully!",
      feedback
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not save feedback",
      error: error.message
    });
  }
});

// Get All Feedback
app.get("/api/feedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch feedback"
    });
  }
});

// Start Server
async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI missing in .env");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB Atlas Connected Successfully");
    console.log("Database:", mongoose.connection.name);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
}

startServer();
