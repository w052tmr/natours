const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            required: [true, 'A booking must have a user.'],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            required: [true, 'A booking must belong to a tour.'],
        },
        price: {
            type: Number,
            required: [true, 'A booking must have a price amount.'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        paid: {
            type: Boolean,
            default: true,
        },
    },
    {
        toJSON: true,
        toObject: true,
        strictQuery: true,
        id: false,
        virtuals: true,
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
