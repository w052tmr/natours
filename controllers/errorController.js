const AppError = require('../utils/appError');

sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack,
        });
    }

    res.status(err.statusCode).render('error', {
        title: 'Something Went Wrong',
        message: err.message,
    });
};

const handleCastError = (err) => {
    return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateKeyError = (err) => {
    // const keysArr = Object.keys(err.keyValue);
    const valuesArr = Object.values(err.keyValue);
    // const keys = keysArr.join(',');
    const values = valuesArr.join(',');
    return new AppError(`${values} already exists.`, 400);
};

const handleValidationError = (err) => {
    const errorMessages = Object.values(err.errors).map((el) => {
        return el.message;
    });
    const message = `${errorMessages.join(' ')}`;

    return new AppError(message, 400);
};

const handleJWTError = (err, res) => {
    res.clearCookie('jwt');
    return new AppError(
        'Invalid or Malformed Token. Please log in to get a new one.',
        401
    );
};

const handleTokenExpiredError = (err) => {
    return new AppError(
        'Token is expired. Please log in to get a new one.',
        401
    );
};

sendErrorPro = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }

        console.error('ERROR', err);

        return res.status(500).json({
            status: 'Internal Server Error',
            message: 'Something went very wrong',
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something Went Wrong',
            message: err.message,
        });
    }

    console.error('ERROR', err);

    return res.status(500).render('error', {
        title: 'Something Went Wrong',
        message: 'Internal server error. Please try again later.',
    });
};

module.exports = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = Object.create(err);

        if (error.name === 'CastError') {
            error = handleCastError(error);
        }

        if (error.code === 11000) {
            error = handleDuplicateKeyError(error);
        }

        if (error.name === 'ValidationError') {
            error = handleValidationError(error);
        }

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError(error, res);
        }

        if (error.name === 'TokenExpiredError, res') {
            error = handleTokenExpiredError(error);
        }

        // jwt error
        sendErrorPro(error, req, res);
    }
};
