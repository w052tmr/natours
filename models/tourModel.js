const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name.'],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price.'],
        },
        ratingsAverage: {
            type: Number,
            required: [true, 'A tour must have a rating.'],
            min: 0.0,
            max: 5.0,
            default: 4.5,
            set: (val) => Math.round(val * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            required: [true, 'A tour must have a ratings quantity.'],
            default: 0,
            min: 0,
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration.'],
            min: 1,
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a price.'],
            enum: ['easy', 'medium', 'difficult'],
            message:
                "A difficulty may only be 'easy', 'medium', or 'difficult'",
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a max group size.'],
        },
        summary: {
            type: String,
            required: [true, 'A tour must have a summary.'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        startDates: {
            type: [Date],
            required: [true, 'A tour must have a start date.'],
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
            },
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: {
                    type: [Number],
                },
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
        imageCover: {
            type: String,
        },
        images: {
            type: [String],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        strictQuery: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.index({ price: 1, ratingsAverage: -1, ratingsQuantity: -1 });

tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordModifiedAt -password -email',
    });

    next();
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'tour',
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
