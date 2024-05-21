const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A user must have a name.'],
            min: [2, 'A name must be at least two characters.'],
            max: [50, 'A name must not exceed 50 characters'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'A user must have an email'],
            unique: true,
            trim: true,
            validate: {
                validator: validator.isEmail,
                message: 'Invalid email. Please correct it and then try again.',
            },
        },
        password: {
            type: String,
            required: [true, 'A user must have a password'],
            min: [8, 'A password must be at least 8 characters'],
            trim: true,
            select: false,
        },
        passwordConfirm: {
            type: String,
            trim: true,
            required: [true, 'You must confirm your password.'],
            validate: {
                validator: function (val) {
                    return this.password === val;
                },
                message: 'Passwords do not match',
            },
        },
        passwordModifiedAt: {
            type: Date,
            default: Date.now(),
        },
        photo: {
            type: String,
            default: 'default.jpg',
        },
        role: {
            type: String,
            enum: ['admin', 'guide', 'guide-lead', 'user'],
            message:
                "A user role may only be defined as 'user', 'guide', 'guide-lead', or 'admin'",
            default: 'user',
        },
        resetToken: {
            type: String,
        },
        resetTokenExpiresAt: {
            type: Date,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        strictQuery: true,
        id: false,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordModifiedAt = Date.now - 1000;
});

userSchema.method('validPassword', async function (testPassword) {
    return await bcrypt.compare(testPassword, this.password);
});

userSchema.method('passwordModifiedAfter', function (jwtIssuedAt) {
    const passwordModifiedAt = parseInt(
        this.passwordModifiedAt.getTime() / 1000,
        10
    );
    return passwordModifiedAt > jwtIssuedAt;
});

userSchema.method('generateResetToken', function () {
    const resetToken = crypto.randomBytes(64).toString('hex');

    this.resetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

    return resetToken;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
