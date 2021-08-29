const mongoose = require('mongoose');
const fs = require('fs');

//Creating Story Schema
const storySchema = new mongoose.Schema({
  storyPhoto: String,
  content: String,
  createdAt: {
    type: Number,
    default: Date.now(),
  },
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});
storySchema.index({ authorId: 1 });

//Converting Story Schema into model and then Exporting
module.exports = mongoose.model('Story', storySchema);
