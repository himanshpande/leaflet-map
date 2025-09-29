const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/loginApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  loginId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ loginId });
    if (existingUser) {
      return res.json({ message: "⚠️ User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const user = new User({ loginId, password: hashedPassword });
    await user.save();

    res.json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // check if user exists
    const user = await User.findOne({ loginId });
    if (!user) return res.json({ message: "❌ User not found" });

    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", user.password);

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) return res.json({ message: "❌ Wrong password" });

    // generate token
    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });

    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
