const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const limit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const toursRoutes = require('./routes/toursRoutes');
const usersRoutes = require('./routes/usersRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes');
const bookingsRoutes = require('./routes/bookingsRoutes');
const viewsRoutes = require('./routes/viewsRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
/*
app.use(cors({
    origin: 'https://www.natours.com',
}))
*/

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                scriptSrc: [
                    "'self'",
                    'https://unpkg.com',
                    'https://*.stripe.com',
                    'https://*.gstatic.com',
                ],
                styleSrc: [
                    "'self'",
                    'https://unpkg.com',
                    'https://*.googleapis.com',
                    'icons.svg',
                    'https://*.stripe.com',
                ],
                imgSrc: [
                    "'self'",
                    'data:',
                    'https://tile.openstreetmap.org',
                    'https://unpkg.com',
                    'https://*.stripe.com',
                ],
                fontSrc: [
                    "'self'",
                    'data:',
                    'https://*.stripe.com',
                    'https://*.gstatic.com',
                ],
            },
        },
    })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = limit.rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,
    message: 'Too many requests from this IP. Try again in one hour.',
});
app.use('/api', limiter);

app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

app.use(mongoSanitize());
app.use(xss());
app.use(compression());

app.use('/', viewsRoutes);
app.use('/api/v1/tours', toursRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/bookings', bookingsRoutes);

app.all('*', (req, res, next) => {
    const message = `Invalid Route: ${req.protocol}://${req.hostname}:${process.env.PORT}${req.originalUrl} does not exist on this server.`;

    return next(new AppError(message, 404));
});

app.use(globalErrorHandler);

module.exports = app;
