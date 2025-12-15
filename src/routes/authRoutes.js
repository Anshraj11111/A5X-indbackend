import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/User.js";

const router = express.Router();

/* =======================
   SIGNUP ROUTE
======================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // Check required fields
    if (!name || !email || !password || !adminCode) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Admin Code Check (trim for safety)
    if (adminCode.trim() !== process.env.ADMIN_CODE) {
      return res.status(401).json({ message: "Invalid Admin Code" });
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password (optimized)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   LOGIN ROUTE
======================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    // Check required fields
    if (!email || !password || !adminCode) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Admin Code Check
    if (adminCode.trim() !== process.env.ADMIN_CODE) {
      return res.status(401).json({ message: "Invalid Admin Code" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
