const express = require('express');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');

const router = new express.Router({ mergeParams: true });

//user must be logged in
router.use(authController.protect);

router.route('/checkout/:tourId').get(bookingsController.getNewCheckoutSession);

//user must be an admin, guide lead, or guide
router.use(authController.restrictAccess('admin', 'guide-lead', 'guide'));

router
    .route('/')
    .get(bookingsController.getAllBookings)
    .post(bookingsController.createBooking);

router
    .route('/:id')
    .get(bookingsController.getBooking)
    .patch(bookingsController.updateBooking)
    .delete(bookingsController.deleteBooking);

module.exports = router;
