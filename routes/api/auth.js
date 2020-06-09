const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');

const { check, validationResult } = require('express-validator');

// @route            GET API/auth
// @description      Test route
// @access           Public
//le middleware 'auth' verifie l'authentification
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route            POST API/auth
// @description      Authentificate user & get token (login)
// @access           Public
//le middleware 'auth' verifie l'authentification
router.post(
  '/',
  [
    check('email', 'Please Include a valid email').isEmail(),
    check('password', 'Please enter a valid password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //check if data is correct (check function --> Name not empty, valid email, password with 6 characters)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    //Check if user exists (check email), if not error
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      //Compare password entered
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      //Returnjsonwebtoken (next video)
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
