const mongoose = require('mongoose');//import mongoose 

const dbConnection = () => {
    //connect with DB
    mongoose.connect(process.env.DB_URI).then((conn) => {

    }).catch((err) => {
        process.exit(1);
    });
};

module.exports = dbConnection;