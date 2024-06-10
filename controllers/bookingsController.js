const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Factory = require('../controllers/factoryHandler');
const catchAsync = require('../utils/catchAsync');

exports.getNewCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        // success_url: `${req.protocol}://${req.get('host')}?user=${
        //     req.user._id
        // }&tour=${tour._id}&price=${tour.price}`,
        succcess_url: `${req.protocol}://${req.get('host')}/myBookings`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${
            tour.slug
        }#bookingBtn`,
        expires_at: Math.round(Date.now() / 1000 + 30 * 60),
        client_reference_id: req.params.tourId,
        customer_email: req.user.email,
        payment_method_types: ['card'],
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`,
                        ],
                    },
                },
            },
        ],
    });

    res.status(200).json({
        status: 'success',
        session,
    });
});

// exports.bookAfterCheckout = catchAsync(async (req, res, next) => {
//     const { user, tour, price } = req.query;

//     if (!user || !tour || !price) return next();

//     await Booking.create({ user, tour, price });

//     res.redirect(`${req.protocol}://${req.get('host')}/myBookings`);

//     next();
// });

const createBookingAfterCheckout = catchAsync(async (req, res, next) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email }))._id;
    const price = session.line_items[0].price_data.unit_amount / 100;

    await Booking.create({ tour, user, price });
});

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers('stripe-sgnature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_CHECKOUT_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.complete')
        createBookingAfterCheckout(event.data.object);

    res.status(200).json({
        received: true,
    });
};

exports.getAllBookings = Factory.getAll(Booking);
exports.getBooking = Factory.getOne(Booking, []);
exports.updateBooking = Factory.updateOne(Booking);
exports.createBooking = Factory.createOne(Booking);
exports.deleteBooking = Factory.deleteOne(Booking);

exports.getUserBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.params.userId });

    res.status(200).json({
        status: 'success',
        bookings,
    });
});
