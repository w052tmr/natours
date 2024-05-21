require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const toursData = JSON.parse(
    fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const usersData = JSON.parse(
    fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviewsData = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB)
    .then(() => {
        console.log('Successfully connected to database...');
    })
    .catch((err) => {
        console.log(err);
    });

const importData = async () => {
    try {
        await Promise.all([
            Tour.create(toursData),
            User.create(usersData, {
                validateBeforeSave: false,
            }),
            Review.create(reviewsData),
        ]);
    } catch (err) {
        console.log(err);
    }

    console.log('Data imported to database!');
    process.exit(1);
};

const deleteData = async () => {
    try {
        await Promise.all([
            Tour.deleteMany(),
            User.deleteMany(),
            Review.deleteMany(),
        ]);
    } catch (err) {
        console.log(err);
    }

    console.log('Data deleted from database!');
    process.exit(1);
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
