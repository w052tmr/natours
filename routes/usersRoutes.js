const express = require('express');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const bookingsRouter = require('./bookingsRoutes');

const router = new express.Router();

router.use('/:userId/bookings', bookingsRouter);

router.route('/signup').post(authController.signupUser);

router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);

router.route('/logout').get(authController.logout);

router.route('/resetPassword/:resetToken').post(authController.resetPassword);

router.use(authController.protect);

router.route('/deactivateMe').delete(usersController.deactivateMe);

router
    .route('/updateMe')
    .patch(
        usersController.uploadUserPhoto,
        usersController.processUserPhoto,
        usersController.updateMe
    );

router.route('/changePassword').patch(authController.changePassword);

router.use(authController.restrictAccess('admin'));

router.route('/').get(usersController.getAllUsers);

router
    .route('/:id')
    .get(usersController.getUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser);

module.exports = router;
