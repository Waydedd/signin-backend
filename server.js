const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Init app
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));

// Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String, 
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => res.json({ status: "ok", message: "Server is running" }));

/**
 * Save email & password (no checking for existing user)
 */
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const newUser = new User({ email, password });
    await newUser.save();

    res.redirect("/secure-doc");
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Example secure-doc route
app.get("/secure-doc", (req, res) => {
  res.send("<h1>Welcome to Secure Docs </h1>");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
