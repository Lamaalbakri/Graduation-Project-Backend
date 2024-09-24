const mongoose = require('mongoose');//import mongoose 

const dbConnection = () => {
    //connect with DB
    mongoose.connect(process.env.DB_URI).then((conn) => {
        console.log(`connection by DB is correct: ${conn.connection.host}`)
    }).catch((err) => {
        console.log(`Connection fsild ${err}`);
        process.exit(1);
    });
};

module.exports = dbConnection;