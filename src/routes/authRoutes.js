import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, password, adminCode } = req.body;

  if (!name || !email || !password || !adminCode)
    return res.status(400).json({ message: 'All fields required' });

  if (!validator.isEmail(email))
    return res.status(400).json({ message: 'Invalid email format' });

  // Admin Code Check
  if (adminCode !== process.env.ADMIN_CODE)
    return res.status(401).json({ message: 'Invalid Admin Code' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashed });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user });
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password, adminCode } = req.body;

  if (!email || !password || !adminCode)
    return res.status(400).json({ message: 'All fields required' });

  // Admin Code Check
  if (adminCode !== process.env.ADMIN_CODE)
    return res.status(401).json({ message: 'Invalid Admin Code' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user });
});

export default router;
