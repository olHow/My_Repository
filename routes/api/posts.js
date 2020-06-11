const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

const { check, validationResult } = require('express-validator');

// @route            POST API/posts
// @description      Create a post
// @access           private
router.post(
  '/',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById({ _id: req.user.id }).select(
        '-password'
      );

      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      const post = new Post(newPost);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route            GET API/posts
// @description      Get all post
// @access           private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    if (!posts) {
      return res.status(404).json({ msg: 'There is no Post' });
    }
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route            GET API/posts/:id
// @description      Get a post by his ID
// @access           private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById({ _id: req.params.id });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route            DELETE API/posts/:id
// @description      delete a post by his ID
// @access           private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById({ _id: req.params.id });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    if (req.user.id !== post.user.toString()) {
      //req.user.id est un string alors que post.user est un object ID.
      //On vérifie que celui qui supprime le post est le propriétaire du post
      return res
        .status(401)
        .json({ msg: 'No authorization to remove this post' });
    }
    await post.remove();
    res.json({ msg: 'Post Removed' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
