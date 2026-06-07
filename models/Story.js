const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

module.exports = mongoose.model('Story', StorySchema);