const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Signup
router.post('/signup', [
    body('email').isEmail(),
    body('username').matches(/^[a-z0-9._]+$/),
    body('password').isLength({ min: 6 })
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, username, password, name } = req.body;
    try {
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) return res.status(400).json({ msg: 'User already exists' });
        user = new User({ email, username, password, name });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', [
    body('identifier').notEmpty(),
    body('password').exists()
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { identifier, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) { console.error(err.message);
        res.status(500).send('Server error'); }
});

module.exports = router;