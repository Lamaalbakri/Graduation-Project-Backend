const express = require('express');//import the express library
const dotenv = require('dotenv');// import the dotenv library for environment variables
const morgan = require('morgan');//import morgan middleware for HTTP request 
const cors = require('cors');


//Load variables from config.env file
dotenv.config({ path: 'config.env' });
const dbConnection = require('./config/database');
const rawMaterialRequestRoute = require('./routes/rawMaterialRequestRoute')

//connect with DB

dbConnection();

//Create a server application (app express)
const app = express();

// // Enable CORS for cross-origin requests
app.use(cors());

//middleware :use morgan, always use it before the Route
app.use(express.json());//parsing the json to js object , so we can read and use it.

if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`);
}

//Mount Route
app.use('/api/v1/rawMaterialRequest', rawMaterialRequestRoute)


//get the port from config.env file
const PORT = process.env.PORT || 8500;

//Start the server and start listening for incoming requests on port 8000.
app.listen(PORT, () => {
    console.log(`App run in port ${PORT}`);
});
