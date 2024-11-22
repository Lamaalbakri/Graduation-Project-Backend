const express = require('express');//import the express library
const authService = require("../services/authService")
const { getGoodsDistributorPreviousRequests,
    getGoodsDistributorPreviousRequestById,
    getGoodsDistributorPreviousRequestByMSlug,
    getGoodsDistributorPreviousRequestByName,
    createGoodsDistributorPreviousRequest,
    updateGoodsDistributorPreviousRequest,
    deleteGoodsDistributorPreviousRequest,
    getGoodsPreviousRequestsforRetalier
} = require('../services/goodsDistributorsPreviousRequestService');
const router = express.Router();

router.route('/')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsDistributorPreviousRequests)
    .post(authService.verifyToken, createGoodsDistributorPreviousRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsDistributorPreviousRequestById)
    .put(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), updateGoodsDistributorPreviousRequest)
    .delete(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), deleteGoodsDistributorPreviousRequest); 
router.route('/retailer/slug/:slug')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsDistributorPreviousRequestByMSlug);
router.route('/retailerName/:retailerName')
    .get(authService.verifyToken, authService.allowedTo('distributor', 'retailer'), getGoodsDistributorPreviousRequestByName);
router.route('/retailer/order')
    .get(authService.verifyToken, getGoodsPreviousRequestsforRetalier)

module.exports = router;