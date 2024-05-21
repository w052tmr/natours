const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(reviewsController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictAccess('user'),
        reviewsController.setTourAndUserIds,
        reviewsController.createReview
    );

router
    .route('/:id')
    .get(reviewsController.getReview)
    .patch(
        authController.protect,
        authController.restrictAccess('user', 'admin'),
        reviewsController.updateReview
    )
    .delete(
        authController.protect,
        authController.restrictAccess('user', 'admin'),
        reviewsController.deleteReview
    );

module.exports = router;
