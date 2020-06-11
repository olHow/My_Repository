const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
//const url = require('url');
const request = require('request');
const config = require('config');

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
// @description      delete profile & user & (posts)
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

// @route            PUT API/profile/experience
// @description      Add profile experience
// @access           Private
router.put(
  '/experience',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title, // revient à écrire title: title qui va chercher la constante title du dessus qui vient du req.body
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json({ profile });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route            DELETE API/profile/experience/:exp_id
// @description      delete profile experience
// @access           Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const indexToRemove = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    if (indexToRemove !== -1) {
      // pas dans le tuto. S'il trouve pas l'exp id dans le tableau (url bidon --> index = -1),
      //, dans ce cas il efface pas le premier du tableau (ce qu'il se passe lorsqu'on splice(-1,1))
      profile.experience.splice(indexToRemove, 1);
    }
    await profile.save();
    res.send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route            PUT API/profile/education
// @description      Add profile education
// @access           Private
router.put(
  '/education',
  [
    auth,
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('to', 'To date is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school, // revient à écrire school: school qui va chercher la constante school du dessus qui vient du req.body
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEducation);
      await profile.save();
      res.json({ profile });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route            DELETE API/profile/education/:educ_id
// @description      delete profile education
// @access           Private
router.delete('/education/:educ_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const indexToRemove = profile.education
      .map((item) => item.id)
      .indexOf(req.params.educ_id);

    if (indexToRemove !== -1) {
      // pas dans le tuto. S'il trouve pas l'exp id dans le tableau (url bidon --> index = -1),
      //, dans ce cas il efface pas le premier du tableau (ce qu'il se passe lorsqu'on splice(-1,1))
      profile.education.splice(indexToRemove, 1);
    }
    await profile.save();
    res.send(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route            GET API/profile/github/:username
// @description      get GitHub Repository
// @access           Public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `http://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId' //client id récupéré du site github en créant l'app. DIso sur config/default.json
      )}&client_secret=${config.get('githubSecret')}}`, //idem que client id pour la clé secrete
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    request(options, (error, response, body) => {
      // grâce au module "request que l'on vient d'importer"
      if (error) {
        console.error(error);
      }
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github Profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
