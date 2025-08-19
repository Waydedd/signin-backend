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
  password: String,  // ⚠️ plain text (test only!)
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => res.send("Server is running"));

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const newUser = new User({ email, password });
  await newUser.save();

  res.status(201).json({ message: "User registered", user: newUser });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
