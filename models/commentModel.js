const mongoose = require('mongoose');

//Creating New Comments Schema
const commentSchema = new mongoose.Schema({
  text: String,
  dateadded: {
    type: Date,
    default: Date.now(),
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  postId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  },
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  authorUsername: String,
  likes: [String],
});

//Converting Schema To Model And Then Exporting
module.exports = mongoose.model('Comment', commentSchema);
