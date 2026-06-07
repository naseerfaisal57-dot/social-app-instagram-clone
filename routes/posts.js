const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');

// simple disk storage for uploaded images
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});
const upload = multer({ storage });

// Create post (multipart form with image)
router.post('/', auth, upload.single('image'), async(req, res) => {
    try {
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
        const post = new Post({ user: req.user.id, imageUrl, caption: req.body.caption || '' });
        await post.save();
        res.json(post);
    } catch (err) { console.error(err);
        res.status(500).send('Server error'); }
});

// Get feed - posts from following users or public chronological
router.get('/feed', auth, async(req, res) => {
    try {
        const following = await Follow.find({ follower: req.user.id }).select('following');
        const ids = following.map(f => f.following);
        // include own posts
        ids.push(req.user.id);
        const posts = await Post.find({ user: { $in: ids } }).sort({ createdAt: -1 }).limit(50).populate('user', 'username avatarUrl');
        res.json(posts);
    } catch (err) { res.status(500).send('Server error'); }
});

// Like / Unlike
router.post('/:id/like', auth, async(req, res) => {
    try {
        const postId = req.params.id;
        const existing = await Like.findOne({ post: postId, user: req.user.id });
        if (existing) { await existing.remove(); return res.json({ liked: false }); }
        const like = new Like({ post: postId, user: req.user.id });
        await like.save();
        res.json({ liked: true });
    } catch (err) { res.status(500).send('Server error'); }
});

// Comments
router.post('/:id/comments', auth, async(req, res) => {
    try {
        const comment = new Comment({ post: req.params.id, user: req.user.id, text: req.body.text });
        await comment.save();
        const populated = await comment.populate('user', 'username');
        res.json(populated);
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;