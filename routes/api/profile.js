const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const url = require('url');

const { check, validationResult } = require('express-validator');

// @route            GET API/profile/me
// @description      Get current users profile
// @access           Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']); // pour l'affichage uniquement? user va avoir des sous categ name et avatar

    if (!profile) {
      return res.status(400).json({ msg: 'There is no Profile' });
    }
    return res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route            POST API/profile
// @description      create or update users profile
// @access           Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Please enter a status').not().isEmpty(),
      check('skills', 'Please enter skills').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;

    //Build profile object
    const profileFields = {};

    profileFields.user = req.user.id;
    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (status) {
      profileFields.status = status;
    }
    if (skills) {
      profileFields.skills = skills.split(',').map((skills) => skills.trim());
      //String --> tableau (séparation par  ",") --> enlève les espaces avant après
    }
    if (bio) {
      profileFields.bio = bio;
    }
    if (githubusername) {
      profileFields.githubusername = githubusername;
    }

    //Build social object
    profileFields.social = {};
    if (youtube) {
      profileFields.social.youtube = youtube;
    }
    if (twitter) {
      profileFields.social.twitter = twitter;
    }
    if (facebook) {
      profileFields.social.facebook = facebook;
    }
    if (linkedin) {
      profileFields.social.linkedin = linkedin;
    }
    if (instagram) {
      profileFields.social.instagram = instragram;
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update Profile (si existe)
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ); // 1er param pour trouver, 2ème pour update, 3ème pour renvoyer le nouveau profile créé
        return res.json(profile);
      }

      //Create Profile (si existe pas)
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(400).json({ errors: errors.array() });
    }
  }
);

// @route            GET API/profile/
// @description      Get all profiles
// @access           Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']); // pour l'affichage uniquement? user va avoir des sous categ name et avatar

    if (!profiles) {
      return res.status(400).json({ msg: 'There is no Profile' });
    }
    return res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route            GET API/profile/user/:user_id
// @description      Get profile by user ID
// @access           Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']); // pour l'affichage uniquement? user va avoir des sous categ name et avatar

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      //Cas où le :user_id n'a pas le bon format (ce n'est pas une erreur de server)
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route            DELETE API/profile/
// @description      delete profile & user
// @access           Private
router.delete('/', auth, async (req, res) => {
  try {
    //@to do : delete posts from user

    //delete profile
    await Profile.findOneAndDelete({ user: req.user.id });

    //delete user
    await User.findOneAndDelete({ _id: req.user.id });
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
