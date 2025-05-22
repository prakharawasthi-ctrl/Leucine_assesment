// backend/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../data-source');
const { User } = require('../entities/User');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOneBy({ username });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepo.create({ username, password: hashedPassword, role });
    await userRepo.save(user);
    res.status(201).json({ msg: 'User created successfully' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});
// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: req.user.id });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    console.error('Get Me Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


module.exports = router;
