const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');
const decryptController = require('../controllers/decryptController');

const router = express.Router();

router
    .route('/')
    .get(blogController.getAllBlogs)
    .post(
        decryptController.getDecryptedData,
        // authController.protect,
        blogController.createBlog
    );

router
    .route('/:id')
    .get(blogController.getBlog)
    .put(
        decryptController.getDecryptedData,
        // authController.protect,
        blogController.editBlog
    )
    .delete(authController.protect, blogController.deleteBlog);

// Comments
// router.use(authController.protect);

router
    .route('/:id/comments')
    .get(blogController.getAllComments)
    .post(decryptController.getDecryptedData, blogController.postComment);

router
    .route('/:id/comment')
    .get(blogController.getComment)
    // front-end not call this line
    .put(decryptController.getDecryptedData, blogController.editComment)
    .delete(blogController.deleteComment);

module.exports = router;