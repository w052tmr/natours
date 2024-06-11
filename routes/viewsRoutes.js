const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');

const router = express.Router();

router.use('*', authController.isLoggedIn);

router.get('/login', viewsController.getLogin);
router.get('/signup', viewsController.getSignup);
router.get('/forgotPassword', viewsController.getForgotPassword);
router.get('/passwordReset/:token', viewsController.getPasswordReset);

router.use(viewsController.alert);

router.get('/', viewsController.getOverview);

router.get('/tour/:slug', viewsController.getTour);

router.get('/myBookings', viewsController.getMyBookings);

router.get(
    '/accountSettings',
    authController.protect,
    viewsController.getAccountSettings
);

module.exports = router;
