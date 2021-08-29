const express = require('express');
const StoryController = require('./../Controller/storyController');
const authController = require('./../Controller/authController');
const { route } = require('./userRoutes');

//Creating Express Router for Story Routes
const router = express.Router();

//Protects a Route from Unautheticated user
router.patch(
  '/',
  authController.protectAccess,
  StoryController.uploadStoryImg,
  StoryController.resizeStoryPhoto,
  StoryController.createStory
);

//Exporting Module
module.exports = router;
