const express = require('express');//import the express library
const authService = require("../services/authService")
const { getGoodsDistributorCurrentRequests,
    getGoodsDistributorCurrentRequestById,
    getGoodsDistributorCurrentRequestByMSlug,
    getGoodsDistributorCurrentRequestByName,
    createGoodsDistributorCurrentRequest,
    updateGoodsDistributorCurrentRequest,
    deleteGoodsDistributorCurrentRequest,
    getGoodsCurrentRequestsforRetalier
} = require('../services/goodsDistributorsCurrentRequestService');
const router = express.Router();

router.route('/')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsDistributorCurrentRequests)
    .post(authService.verifyToken, authService.allowedTo('retailer'), createGoodsDistributorCurrentRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsDistributorCurrentRequestById)
    .put(authService.verifyToken, authService.allowedTo('distributor', 'transporter'), updateGoodsDistributorCurrentRequest)
    .delete(authService.verifyToken, authService.allowedTo('distributor'), deleteGoodsDistributorCurrentRequest);
router.route('/retailer/slug/:slug')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsDistributorCurrentRequestByMSlug);
router.route('/retailerName/:retailerName')
    .get(authService.verifyToken, authService.allowedTo('distributor'), getGoodsDistributorCurrentRequestByName);

//give all curren request to the spicefic distributor id 
router.route('/retailer/order')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsCurrentRequestsforRetalier)

module.exports = router;