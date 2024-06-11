const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const slug = req.params.slug;

    const tour = await Tour.findOne({ slug }).populate('reviews');
    if (!tour) return new AppError('Could not find tour.', 404);

    res.status(200).render('tour', {
        title: tour.name,
        tour,
    });
});

exports.getLogin = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Login',
    });
});

exports.getSignup = (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Signup',
    });
};

exports.getAccountSettings = (req, res, next) => {
    res.status(200).render('account', {
        title: `${req.user.name} Account Settings`,
        user: req.user,
    });
};

exports.getForgotPassword = (req, res, next) => {
    res.status(200).render('forgotPassword', {
        title: 'Forgot Password',
    });
};

exports.getPasswordReset = (req, res, next) => {
    res.status(200).render('passwordReset', {
        title: 'Reset Password',
        token: req.params.token,
    });
};

exports.getMyBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user._id });

    const tours = await Promise.all(
        bookings.map(async (booking) => {
            return await Tour.findById(booking.tour);
        })
    );

    res.status(200).render('overview', {
        title: 'My Bookings',
        tours,
    });
});

exports.alert = (req, res, next) => {
    const { alert } = req.query;

    if (alert === 'booking') {
        res.locals.alert =
            'Your tour was booked successfully! If you do not see it in your bookings, try refreshing the page, or come back later.';
    }

    next();
};
