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

    //Check user
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

// @route            PUT API/posts/like/:id
// @description      Like a post
// @access           private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // check if already been liked --> On filtre dans les like ceux qui ont le même user que celui en train de liker
    // Si le tableau renvoyé à une taille positive, alors c'est déjà liké
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route            PUT API/posts/unlike/:id
// @description      Unlike a post
// @access           private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // check if has not yes been liked --> On filtre dans les like ceux qui ont le même user que celui en train de liker
    // Si le tableau renvoyé à une taille positive, alors c'est déjà liké
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // trouver l'index du post avec l'id de l'user (
    //nb: le map permet de les transformer en chaine de caractère. Renvoit le même tableau mais au bon format et seulement avec la liste des like (sans les id)
    const indexOfLikeToRemove = post.likes
      .map((likes) => likes.user.toString())
      .indexOf(req.user.id);

    //remove le like
    post.likes.splice(indexOfLikeToRemove, 1);
    await post.save();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route            POST API/posts/comment/:post_id
// @description      Create a comment
// @access           private
router.post(
  '/comment/:post_id',
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
      const post = await Post.findById(req.params.post_id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route            DELETE API/posts/comment/:post_id/:comment_id
// @description      delete a comment
// @access           private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //Trouver le comment
    //NB: findbyID est une méthode mongoose qui ne marche que sur des models définis.
    //Ici ce n'est pas le cas de comment, contrairement à post, il faut donc utiliser la méthode classique find(), relative aux tableaux
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    ); // renvoit l'id ou false
    if (!comment) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    //Check user
    if (req.user.id !== comment.user.toString()) {
      //req.user.id est un string alors que post.user est un object ID.
      //On vérifie que celui qui supprime le post est le propriétaire du post
      return res
        .status(401)
        .json({ msg: 'No authorization to remove this comment' });
    }

    // trouver l'index du comment avec l'id du comment (
    //nb: le map permet de les transformer en chaine de caractère. Renvoit le même tableau mais au bon format et seulement avec la liste des like (sans les id)
    const indexOfCommentToRemove = post.comments
      .map((comments) => comments.user.toString())
      .indexOf(req.user.id);

    //remove le comment
    post.comments.splice(indexOfCommentToRemove, 1);
    await post.save();

    res.json({ msg: 'Comment Removed' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
