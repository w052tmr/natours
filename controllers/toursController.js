const multer = require('multer');
const sharp = require('sharp');
const fsp = require('fs').promises;

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    }
    cb(new AppError('You may only upload images', 400), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
    {
        name: 'imageCover',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 3,
    },
]);

const deleteTourImages = async (images) => {
    await Promise.all(
        images.map(async (img) => {
            await fsp.unlink(`public/img/tours/${img}`);
        })
    );
};

exports.processTourImages = catchAsync(async (req, res, next) => {
    let tour = {};
    if (req.files) {
        tour = await Tour.findById(req.params.id);

        if (req.files.images) {
            let tourImages = [];
            await Promise.all(
                req.files.images.map(async (image, indx) => {
                    const filename = `tourImage${indx + 1}-${
                        req.params.id
                    }-${Date.now()}.jpeg`;

                    await sharp(req.files.images[indx].buffer)
                        .resize(2000, 1333)
                        .toFormat('jpeg')
                        .jpeg({ quality: 90 })
                        .toFile(`public/img/tours/${filename}`);

                    tourImages.push(filename);
                })
            );

            req.body.images = tourImages;

            if (tour.images.length > 0) await deleteTourImages(tour.images);
        }

        if (req.files.imageCover) {
            req.body.imageCover = `tourImageCover-${
                req.params.id
            }-${Date.now()}.jpeg`;

            await sharp(req.files.imageCover[0].buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${req.body.imageCover}`);

            if (tour.imageCover) await deleteTourImages([tour.imageCover]);
        }
    }

    next();
});

exports.getTopRated = catchAsync(async (req, res, next) => {
    req.query.fields =
        'name,price,ratingsAverage,ratingsQuantity,difficult,summary, difficulty';
    req.query.sort = '-ratingsAverage,price';
    req.query.limit = '5';
    next();
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, ['reviews']);
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $group: {
                _id: '$difficulty',
                difficulty: {
                    $first: '$difficulty',
                },
                numTours: { $sum: 1 },
                tours: {
                    $push: '$name',
                },
                averageRating: {
                    $avg: '$ratingsAverage',
                },
                numRatings: {
                    $sum: '$ratingsQuantity',
                },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: {
                averageRating: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getYearlyPlan = catchAsync(async (req, res, next) => {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                },
                startDates: {
                    $lt: new Date(`${year + 1}-01-01`),
                },
            },
        },
        {
            $addFields: {
                month: {
                    $arrayElemAt: [
                        [
                            '',
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December',
                        ],
                        { $month: '$startDates' },
                    ],
                },
            },
        },
        {
            $group: {
                _id: {
                    $month: '$startDates',
                },
                month: { $first: '$month' },
                tours: {
                    $push: '$name',
                },
                startDays: {
                    $push: {
                        $dayOfMonth: '$startDates',
                    },
                },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        results: plan.length,
        data: {
            plan,
        },
    });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, coordinates, unit } = req.params;
    const [lat, lng] = coordinates.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.15214;

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng * 1, lat * 1], radius],
            },
        },
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getTourDistances = catchAsync(async (req, res, next) => {
    const { coordinates, unit } = req.params;
    const [lat, lng] = coordinates.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const data = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'dist',
                distanceMultiplier: multiplier,
            },
        },
        {
            $addFields: {
                distance: {
                    $round: ['$dist', 1],
                },
            },
        },
        {
            $project: {
                name: 1,
                distance: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data,
        },
    });
});
