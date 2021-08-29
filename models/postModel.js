const mongoose = require('mongoose');

//Creating Post Schema
const postSchema = new mongoose.Schema({
  caption: String,
  postContent: String,
  createdDate: {
    type: Number,
    default: new Date().getTime(),
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  authorUsername: String,
  comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
  ],
  likes: [String],
  image: String,
});

//Converting post schema to model and then Exporting
module.exports = mongoose.model('Post', postSchema);
