const express = require('express');//import the express library
const authService = require("../services/authService")
const { getGoodsManufacturerCurrentRequests,
    getGoodsManufacturerCurrentRequestById,
    getGoodsManufacturerCurrentRequestByMSlug,
    getGoodsManufacturerCurrentRequestByName,
    createGoodsManufacturerCurrentRequest,
    updateGoodsManufacturerCurrentRequest,
    deleteGoodsManufacturerCurrentRequest,
    getGoodsCurrentRequestsforDistributor
} = require('../services/goodsManufacturersCurrentRequestService');
const router = express.Router();

router.route('/')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsManufacturerCurrentRequests)
    .post(authService.verifyToken, authService.allowedTo('distributor'), createGoodsManufacturerCurrentRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsManufacturerCurrentRequestById)
    .put(authService.verifyToken, authService.allowedTo('manufacturer', 'transporter'), updateGoodsManufacturerCurrentRequest)
    .delete(authService.verifyToken, authService.allowedTo('manufacturer'), deleteGoodsManufacturerCurrentRequest);
router.route('/distributor/slug/:slug')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsManufacturerCurrentRequestByMSlug);
router.route('/distributorName/:distributorName')
    .get(authService.verifyToken, authService.allowedTo('manufacturer'), getGoodsManufacturerCurrentRequestByName);

//give all curren request to the spicefic distributor id 
router.route('/distributor/order')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsCurrentRequestsforDistributor)

module.exports = router;