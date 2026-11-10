const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://feedback-bu8h.vercel.app/"
  ],
  credentials: true
}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Feedback Server Running ✅");
});

app.post("/api/feedback", (req, res) => {
    const feedbackData = req.body;

    console.log("Received Feedback:", feedbackData);

    res.status(200).json({
        message: "Feedback received successfully!"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

