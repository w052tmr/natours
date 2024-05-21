const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            trim: true,
        },
        rating: {
            type: Number,
            min: [0.0, 'A rating may not be below 0.0'],
            max: [5.0, 'A rating may not exceed 5.0'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a user.'],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'A review must belong to a tour.'],
        },
    },
    {
        strictQuery: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.index({ tour: 1, author: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'author',
        select: '-email -passwordModifiedAt -__v -active -role -password',
    });

    next();
});

reviewSchema.statics.calcReviewRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: {
                tour: tourId,
            },
        },
        {
            $group: {
                _id: '$tour',
                numRatings: {
                    $sum: 1,
                },
                avgRating: {
                    $avg: '$rating',
                },
            },
        },
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].numRatings,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }

    return;
};

reviewSchema.post('save', function () {
    this.constructor.calcReviewRating(this.tour);
});

reviewSchema.post(/^findOneAnd/, function (doc) {
    if (doc) {
        doc.constructor.calcReviewRating(doc.tour);
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
