const express = require('express');
const router = express.Router();

// @route            GET API/posts
// @description      Test route
// @access           Public
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;
