const express = require('express');//import the express library
const authService = require("../services/authService")
const { getRawMaterialCurrentRequests,
    createRawMaterialCurrentRequest,
    getRawMaterialCurrentRequestById,
    getRawMaterialCurrentRequestByMSlug,
    updateRawMaterialCurrentRequest,
    deleteRawMaterialCurrentRequest,
    getRawMaterialCurrentRequestByMName,
    getRawMaterialCurrentRequestsforManufacturer
} = require('../services/rowMaterialCurrentRequestService');


const router = express.Router();

//Routes
router.route('/')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialCurrentRequests)
    .post(authService.verifyToken, authService.allowedTo('manufacturer'), createRawMaterialCurrentRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialCurrentRequestById)
    .put(authService.verifyToken, authService.allowedTo('supplier', 'transporter'), updateRawMaterialCurrentRequest)
    .delete(authService.verifyToken, authService.allowedTo('supplier'), deleteRawMaterialCurrentRequest); // Define a special path for ObjectId
router.route('/manufacturer/slug/:slug')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialCurrentRequestByMSlug); // Path to search for manufacturer slug
router.route('/manufacturerName/:manufacturerName')
    .get(authService.verifyToken, authService.allowedTo('supplier'), getRawMaterialCurrentRequestByMName);

//give all curren request to the spicefic manufacturer id 
router.route('/manufacturer/order')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialCurrentRequestsforManufacturer)
module.exports = router;