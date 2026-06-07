const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Story = require('../models/Story');

const storage = multer.diskStorage({
    destination: function(req, file, cb) { cb(null, path.join(__dirname, '..', 'public', 'uploads')); },
    filename: function(req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

router.post('/', auth, upload.single('image'), async(req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
        const story = new Story({ user: req.user.id, imageUrl });
        await story.save();
        res.json(story);
    } catch (err) { res.status(500).send('Server error'); }
});

// Get active stories
router.get('/', auth, async(req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 }).limit(200).populate('user', 'username avatarUrl');
        res.json(stories);
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;