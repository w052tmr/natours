const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendMail = require('../utils/sendMail');
const crypto = require('crypto');

const sendTokenResponse = (user, statusCode, res, email = false) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    });

    if (email) {
    }

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        user,
    });
};

exports.signupUser = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;

    const user = await User.create({
        name,
        email,
        password,
        passwordConfirm,
    });

    try {
        await new sendMail(
            user,
            `${req.protocol}://${req.get('host')}/login`
        ).welcome();
    } catch (err) {
        console.log(err);
        return next(
            new AppError(
                'Account creation successful! But there was an error logging you in and sending your welcome email',
                err.statusCode
            )
        );
    }

    sendTokenResponse(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    //check that user email and password are correct
    if (!user || !(await user.validPassword(password))) {
        return next(
            new AppError(
                'Invalid email or password. Recheck your credentials.',
                401
            )
        );
    }

    if (!user.active) {
        user.active = true;
        await user.save();
    }

    //sendToken
    sendTokenResponse(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // check that token exists
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError(
                'User Authorization Error: Missing Json Web Token. Please log in to your user account to receive access to this protected route. If you do not already have an account, you may create one to receive access.',
                401
            )
        );
    }

    // validate token;
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // confirm that user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError(
                'Authorization Error: The user account belonging to this token is either inactive or no longer exists. To access this protected route, you must create a user account (if you do not currently have one), or you may reactivate your currently inactive account by logging in.',
                401
            )
        );
    }

    //confirm that account is active
    if (!currentUser.active) {
        return next(
            new AppError(
                'Authorization Error: The account belonging to this user is not active. You may log in to reactivate it.',
                401
            )
        );
    }

    // ensure that user has not modified their password since token was issued
    if (currentUser.passwordModifiedAfter(decoded.iat)) {
        return next(
            new AppError(
                'Authorization Error: User password was modified after Json Web Token was issued. To access this protected route, please log in again.',
                401
            )
        );
    }

    // save currentUser data in req obj for later retrieval
    req.user = currentUser;

    next();
});

exports.logout = (req, res, next) => {
    res.clearCookie('jwt');
    res.status(200).json({
        status: 'success',
    });
};

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    // check that token exists
    if (req.cookies.jwt) {
        // validate token;
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwt,
            process.env.JWT_SECRET
        );

        // confirm that user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next();
        }

        //confirm that account is active
        if (!currentUser.active) {
            return next();
        }

        // ensure that user has not modified their password since token was issued
        if (currentUser.passwordModifiedAfter(decoded.iat)) {
            return next();
        }

        // save currentUser data in req obj for later retrieval
        req.user = currentUser;
        res.locals.user = currentUser;
    }

    next();
});

exports.restrictAccess = (...roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next();
        } else {
            return next(
                new AppError(
                    `Unauthorized role '${req.user.role}s' do not have permission to access this route.`,
                    403
                )
            );
        }
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    const resetToken = user.generateResetToken();
    await user.save({ validateModifiedOnly: true });

    try {
        await new sendMail(
            user,
            `${req.protocol}://${req.get('host')}/passwordReset/${resetToken}`
        ).passwordReset();
    } catch (err) {
        console.log(err);
        return next(new AppError('Error Sending Email', err.statusCode));
    }

    res.status(200).json({
        status: 'success',
        message: 'Password reset sent successfully.',
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const { password, passwordConfirm } = req.body;
    if (!password || !passwordConfirm) {
        return next(
            new AppError(
                `Missing credentials for password or passwordConfirm`,
                404
            )
        );
    }

    let resetToken = req.params.resetToken;
    resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({ resetToken });
    if (!user || Date.now() >= user.resetTokenExpiresAt) {
        user.resetToken = undefined;
        user.resetTokenExpiresAt = undefined;
        await user.save();
        return next(
            new AppError(
                'Authorization Error: The token belonging to this user is malformed or expired. Please try again.',
                401
            )
        );
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save({ validateBeforeSave: true });

    sendTokenResponse(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const { passwordOld, passwordNew, passwordNewConfirm } = req.body;
    if (!passwordOld || !passwordNew || !passwordNewConfirm) {
        return next(new AppError('Missing credentials.', 404));
    }

    const user = await User.findOne(req.user).select('+password');
    if (!(await user.validPassword(passwordOld))) {
        return next(new AppError('Your old password is not correct.', 401));
    }

    user.password = passwordNew;
    user.passwordConfirm = passwordNewConfirm;
    await user.save({ validateBeforeSave: true });

    sendTokenResponse(user, 200, res);
});
