const express = require('express');
const { signup, signin, signout, forgotPassword, resetPassword, socialLogin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { createPostValidator, userSignupValidator, passwordResetValidator } = require('../validator');

const router = express.Router();

// social login
router.post("/social-login", socialLogin)

// password forgot reset validator
router.put("/forgot-password", forgotPassword);
router.put("/reset-password", passwordResetValidator, resetPassword);

router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

// userById is executed whenever userId is in the URL
router.param("userId", userById);

module.exports = router;