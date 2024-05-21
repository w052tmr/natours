const multer = require('multer');
const sharp = require('sharp');
const fsp = require('fs').promises;

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const APIFeatures = require('../utils/APIFeatures');
const factory = require('./factoryHandler');

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, []);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        return cb(null, true);
    }

    cb(new AppError('You may only upload an image', 400), false);
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

const deleteCurrentUserPhoto = async (req) => {
    if (req.user.photo && req.user.photo !== 'default.jpg') {
        await fsp.unlink(`public/img/users/${req.user.photo}`);
    }
};

exports.processUserPhoto = catchAsync(async (req, res, next) => {
    if (req.file) {
        req.file.filename = `user-photo_${req.user._id}_${Date.now()}.jpeg`;

        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/users/${req.file.filename}`);

        await deleteCurrentUserPhoto(req);
    }

    next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findOne(req.user);

    if (req.body.name) {
        updatedUser.name = req.body.name;
    }

    if (req.body.email) {
        updatedUser.email = req.body.email;
    }

    if (req.file) {
        updatedUser.photo = req.file.filename;
    }

    await updatedUser.save({ validateModifiedOnly: true });

    updatedUser.password = undefined;

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser,
        },
    });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
    const user = await User.findOne(req.user);
    user.active = false;
    await user.save();
    res.status(204).json({
        status: 'success',
    });
});
