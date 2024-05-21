const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/appError');

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // for allowing nested GET reviews on tour
        let filter = {};
        if (req.params.tourId) filter.tour = req.params.tourId;
        if (req.params.userId) filter.user = req.params.userId;

        // const tours = await Tour.find();
        let query = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .fields()
            .paginate().query;

        const docs = await query;
        // const docs = await query.explain();

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                docs,
            },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findById(req.params.id).populate(
            popOptions.join(' ')
        );

        if (!doc) {
            return next(
                new AppError(
                    `Invalid ID: ${req.params.id} does not exist.`,
                    404
                )
            );
        }

        res.status(200).json({
            status: 'succes',
            data: {
                doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const newDoc = await Model.create(req.body);

        if (!newDoc) {
            return next(
                new AppError(
                    'Could not create new document. Please check that all required fields are present and valid, and then try again.',
                    400
                )
            );
        }

        res.status(201).json({
            status: 'success',
            data: {
                newDoc,
            },
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const updatedDoc = await Model.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                runValidators: true,
                new: true,
            }
        );

        if (!updatedDoc) {
            return next(
                new AppError(
                    `Invalid ID: ${req.params.id} does not exist.`,
                    404
                )
            );
        }

        res.status(200).json({
            status: 'success',
            data: {
                updatedDoc,
            },
        });
    });

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const deletedDoc = await Model.findByIdAndDelete(req.params.id);

        if (!deletedDoc) {
            return next(
                new AppError(
                    `Invalid ID: ${req.params.id} does not exist.`,
                    404
                )
            );
        }

        res.status(204).json({
            status: 'success',
        });
    });
