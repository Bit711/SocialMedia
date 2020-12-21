const express = require('express');
const { 
        getPosts, 
        createPost, 
        postsByUser, 
        postById, 
        isPoster, 
        deletePost, 
        updatePost, 
        photo, 
        singlePost,
        like,
        unlike,
        comment,
        uncomment
    
    } = require('../controllers/post');
const { requireSignin } = require('../controllers/auth');
const { userById } = require('../controllers/user');
const { createPostValidator } = require('../validator');

const router = express.Router();

// requireSignin looks for the token before executing getPosts
router.get('/posts', getPosts);

// like and unlike
router.put("/post/like", requireSignin, like)
router.put("/post/unlike", requireSignin, unlike)

// comments
router.put("/post/comment", requireSignin, comment)
router.put("/post/uncomment", requireSignin, uncomment)

// createPostValidator checks title and body and also checks for errors
router.post('/post/new/:userId', requireSignin, createPost, createPostValidator);


// Get all posts
router.get("/post/:postId", singlePost);
router.get("/posts/by/:userId", postsByUser);
router.put('/post/:postId', requireSignin, isPoster, updatePost)

// Delete post
router.delete('/post/:postId', requireSignin, isPoster, deletePost);

// photo
router.get("/post/photo/:postId", photo);


// userById is executed whenever userId is in the URL
router.param("userId", userById);
router.param("postId", postById);

module.exports = router;

