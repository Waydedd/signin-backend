const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Init app
const app = express();
const PORT = process.env.PORT || 5000;

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
  password: String,  // plain text (only for testing!)
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => res.json({ status: "ok", message: "Server is running" }));

/**
 * STEP 1: Save email only
 */
app.post("/register-email", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const newUser = new User({ email }); // only email
  await newUser.save();

  res.status(201).json({ message: "Email registered", userId: newUser._id });
});

/**
 * STEP 2: Add password to existing email
 */
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email not found. Register first." });

  user.password = password; // update password
  await user.save();

  res.status(201).json({ message: "User registered", user });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
