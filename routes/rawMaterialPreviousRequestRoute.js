const express = require('express');//import the express library
const authService = require("../services/authService");
const { getRawMaterialPreviousRequests,
    createRawMaterialPreviousRequest,
    getRawMaterialPreviousRequestById,
    getRawMaterialPreviousRequestByMSlug,
    updateRawMaterialPreviousRequest,
    deleteRawMaterialPreviousRequest,
    getRawMaterialPreviousRequestByMName,
    getRawMaterialPreviousRequestsforManufacturer

} = require('../services/rowMaterialPreviousRequestService');


const router = express.Router();

//Routes
router.route('/')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialPreviousRequests)
    .post(authService.verifyToken, createRawMaterialPreviousRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialPreviousRequestById)
    .put(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), updateRawMaterialPreviousRequest)
    .delete(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), deleteRawMaterialPreviousRequest); // Define a special path for ObjectId
router.route('/manufacturer/slug/:slug')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialPreviousRequestByMSlug); // Path to search for manufacturer slug
router.route('/manufacturerName/:manufacturerName')
    .get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getRawMaterialPreviousRequestByMName);

router.route('/manufacturer/order')
    .get(authService.verifyToken, getRawMaterialPreviousRequestsforManufacturer)


module.exports = router;