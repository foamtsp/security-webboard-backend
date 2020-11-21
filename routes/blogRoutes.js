const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

router
    .route('/')
    .get(
        authController.protect,
        blogController.getAllBlogs
    )
    .post(
        decryptController.getDecryptedData,
        authController.protect,
        blogController.createBlog
    );

router
    .route('/:id')
    .get(
        authController.protect,
        blogController.getBlog)
    .put(
        decryptController.getDecryptedData,
        authController.protect,
        blogController.editBlog
    )
    .delete(
        authController.protect,
        blogController.deleteBlog
    );

// Comments
// router.use(authController.protect);

router
    .route('/:id/comments')
    .get(authController.protect, blogController.getAllComments)
    .post(
        authController.protect,
        decryptController.getDecryptedData,
        blogController.postComment
    );

router
    .route('/:id/comment')
    .get(
        authController.protect,
        blogController.getComment
    )
    // front-end not call this line
    .put(
        authController.protect,
        decryptController.getDecryptedData,
        blogController.editComment)
    .delete(
        authController.protect,
        decryptController.getDecryptedData,
        blogController.deleteComment
    );

module.exports = router;