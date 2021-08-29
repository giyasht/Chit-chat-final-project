const mongoose = require('mongoose');

//Creating Storycomment Schema
const storycommentSchema = new mongoose.Schema({
  text: String,
  dateadded: {
    type: Date,
    default: Date.now(),
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  storyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Story',
  },
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  authorUsername: String,
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: '24h' },
  },
});

//Converting Story Schema into model and then Exporting
module.exports = mongoose.model('StoryComment', storycommentSchema);
