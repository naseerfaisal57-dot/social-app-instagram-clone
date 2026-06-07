const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Follow = require('../models/Follow');

// Get current user
router.get('/me', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) { res.status(500).send('Server error'); }
});

// Get profile by username
router.get('/:username', async(req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        const followerCount = await Follow.countDocuments({ following: user._id });
        const followingCount = await Follow.countDocuments({ follower: user._id });
        res.json({ user, followerCount, followingCount });
    } catch (err) { res.status(500).send('Server error'); }
});

// Follow / Unfollow
router.post('/:username/follow', auth, async(req, res) => {
    try {
        const target = await User.findOne({ username: req.params.username });
        if (!target) return res.status(404).json({ msg: 'User not found' });
        if (target.id === req.user.id) return res.status(400).json({ msg: 'Cannot follow yourself' });
        const existing = await Follow.findOne({ follower: req.user.id, following: target._id });
        if (existing) {
            await existing.remove();
            return res.json({ following: false });
        }
        const follow = new Follow({ follower: req.user.id, following: target._id });
        await follow.save();
        res.json({ following: true });
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;