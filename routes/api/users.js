const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');

const User = require('../../models/Users');

const { check, validationResult } = require('express-validator');

// @route            POST API/User
// @description      Register user
// @access           Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please Include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with minimum 6 characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //check if data is correct (check function --> Name not empty, valid email, password with 6 characters)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    //Check if user already exist (check email)
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      //get user gravatar
      const avatar = gravatar.url(email, {
        s: '200', //size option
        r: 'pg', // rating option
        d: 'mm', // give a default image if no gravatar
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //Returnjsonwebtoken (next video)

      res.send('User registered');
      console.log(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
