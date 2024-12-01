const express = require('express');//import the express library
const dotenv = require('dotenv');// import the dotenv library for environment variables
const morgan = require('morgan');//import morgan middleware for HTTP request 
const cors = require('cors');
const cookieParser = require('cookie-parser'); // import cookie-parser library

// Load variables from config.env file
dotenv.config({ path: 'config.env' });
const dbConnection = require('./config/database');

const rawMaterialCurrentRequestRoute = require('./routes/rawMaterialCurrentRequestRoute')
const rawMaterialPreviousRequestRoute = require('./routes/rawMaterialPreviousRequestRoute')
const transportRequestsRoute = require('./routes/transportRequestsRoute');
const transporterCurrentRequestRoute = require('./routes/transporterCurrentRequestRoute');
const transporterPreviousRequestRoute = require('./routes/transporterPreviousRequestRoute');
const registerRoute = require('./routes/registerRoute');
const loginRoute = require('./routes/loginRoute');
const protectedRoute = require('./routes/protectedRoute');
const ManageRawMaterialRout = require("./routes/ManageRawMaterialsRouters");
const userRoutes = require('./routes/userRoutes');
const addressRoute = require('./routes/addressRoute');
const shoppingBasketRoute = require('./routes/shoppingBasketRoute');
const supplierRoutes = require('./routes/supplierRoute')
const ManufacturerRoute = require('./routes/manufacturerRoute')
const DistributorRoute = require('./routes/distributorRoute')
const contractRoute = require('./routes/contractRoute')
const manageGoodsManufacturerRoute = require('./routes/ManageGoodsManufacturerRoute')
const goodsManufacturersCurrentRequestRoute = require('./routes/goodsManufacturersCurrentRequestRoute')
const goodsManufacturersPreviousRequestRoute = require('./routes/goodsManufacturersPreviousRequestRoute')
const feedbackRoutes = require('./routes/feedbackRoute')
const manageGoodsDistributorRoute = require('./routes/ManageGoodsDistributorRoute')
const goodsDistributorsCurrentRequestRoute = require('./routes/goodsDistributorsCurrentRequestRoute')
const goodsDistributorsPreviousRequestRoute = require('./routes/goodsDistributorsPreviousRequestRoute')

// Connect with DB
dbConnection();

// Create a server application (app express)
const app = express();

// Enable CORS for cross-origin requests
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // Allow cookies to be sent via CORS
}));

// Activate cookie-parser to read cookies
app.use(cookieParser());

// Middleware :use morgan, always use it before the Route
app.use(express.json()); // parsing the json to js object , so we can read and use it.

if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Route
app.use('/api/v1/rawMaterialCurrentRequest', rawMaterialCurrentRequestRoute)
app.use('/api/v1/rawMaterialPreviousRequest', rawMaterialPreviousRequestRoute)
app.use('/api/v1/transportRequests', transportRequestsRoute);
app.use('/api/v1/transportCurrentRequest', transporterCurrentRequestRoute)
app.use('/api/v1/transportPreviousRequest', transporterPreviousRequestRoute)
app.use('/api/v1/register', registerRoute);
app.use('/api/v1/login', loginRoute);
app.use('/api/v1/protected', protectedRoute);
app.use('/api/v1/manageRawMaterial', ManageRawMaterialRout)
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/address', addressRoute);
app.use('/api/v1/shoppingBasket', shoppingBasketRoute);
app.use('/api/v1/supplier', supplierRoutes);
app.use('/api/v1/manufacturer', ManufacturerRoute)
app.use('/api/v1/distributor', DistributorRoute)
app.use('/api/v1/contract', contractRoute);
app.use('/api/v1/manageGoodsManufacturer', manageGoodsManufacturerRoute);
app.use('/api/v1/goodsManufacturersCurrentRequest', goodsManufacturersCurrentRequestRoute)
app.use('/api/v1/goodsManufacturersPreviousRequest', goodsManufacturersPreviousRequestRoute)
app.use('/api/v1/feedback', feedbackRoutes)
app.use('/api/v1/manageGoodsDistributor', manageGoodsDistributorRoute)
app.use('/api/v1/goodsDistributorsCurrentRequest', goodsDistributorsCurrentRequestRoute)
app.use('/api/v1/goodsDistributorsPreviousRequest', goodsDistributorsPreviousRequestRoute)

// Get the port from config.env file
const PORT = process.env.PORT || 8500;

// Start the server and start listening for incoming requests on port 8000.
app.listen(PORT, () => {
    console.log(`App run in port ${PORT}`);
});
