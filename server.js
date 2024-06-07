process.on('uncaughtException', (err) => {
    console.log('ERROR: Uncaught Exception');
    console.log(err.stack);
    console.log('Shutting Down...');
    process.exit(1);
});

require('dotenv').config();
const mongoose = require('mongoose');

const app = require('./app');

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

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`Listening for requests on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection Error');
    console.log(err.name, err.message);
    console.log('Shutting Down Server...');
    server.close(() => {
        console.log('Server Shut Down Successfully.');
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM Received: Shutting down server gracefully...');
    server.close(() => {
        console.log('Process terminated.');
    });
});
