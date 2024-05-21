const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);
const Tour = require('../models/tourModel');
catchAsync = require('../utils/catchAsync');

exports.getNewCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}`,
        cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
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
                        name: tour.name,
                        description: tour.summary,
                        images: [tour.imageCover],
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
