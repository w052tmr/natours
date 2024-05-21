const express = require('express');
const toursController = require('../controllers/toursController');
const authController = require('../controllers/authController');
const reviewsRoutes = require('../routes/reviewsRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewsRoutes);

router.route('/tourStats').get(toursController.getTourStats);

router.route('/yearlyPlan/:year').get(toursController.getYearlyPlan);

router
    .route('/topRated')
    .get(toursController.getTopRated, toursController.getAllTours);

router
    .route('/toursWithin/:distance/center/:coordinates/unit/:unit')
    .get(toursController.getToursWithin);

router
    .route('/distances/:coordinates/unit/:unit')
    .get(toursController.getTourDistances);

router
    .route('/')
    .get(toursController.getAllTours)
    .post(
        authController.protect,
        authController.restrictAccess('admin'),
        toursController.createTour
    );

router
    .route('/:id')
    .get(toursController.getTour)
    .patch(
        authController.protect,
        authController.restrictAccess('admin', 'guide-lead', 'guide'),
        toursController.uploadTourImages,
        toursController.processTourImages,
        toursController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictAccess('admin', 'guide-lead', 'guide'),
        toursController.deleteTour
    );

module.exports = router;
