const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;

// Catch UNCAUGHT EXCEPTION ERROR
/*process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});*/

// ENV configuration
dotenv.config({
    path: './config.env'
});

const app = require('./app');

// Connect to the database and open server on port...
const uri = process.env.DATABASE_URI.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

let server
const port = process.env.PORT || 9000;

const connectDB = async () => {
    try {
        await MongoClient.connect(uri, mongoOptions, (err, db) => {
            if (err) {
                console.log(`Failed to connect to the database. ${err.stack}`);
            } else {
                app.locals.db = db;
                console.log('DB connection successful!');
            };
        });
    } catch (err) {
        throw new Error(err.message);
    }
}

connectDB(uri).then(() => {
    server = app.listen(port, () => {
        console.log(`App running on port ${port}...`);
    });
});


// UNHANDLED ERROR handler
/*
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    client.close();
    server.close(() => {
        process.exit(1);
    });
});*/