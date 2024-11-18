const express = require('express');//import the express library
const authService = require("../services/authService")
const { getGoodsManufacturerPreviousRequests,
    getGoodsManufacturerPreviousRequestById,
    getGoodsManufacturerPreviousRequestByMSlug,
    getGoodsManufacturerPreviousRequestByName,
    createGoodsManufacturerPreviousRequest,
    updateGoodsManufacturerPreviousRequest,
    deleteGoodsManufacturerPreviousRequest,
    getGoodsPreviousRequestsforDistributor
} = require('../services/goodsManufacturersPreviousRequestService');
const router = express.Router();

router.route('/')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsManufacturerPreviousRequests)
    .post(authService.verifyToken, createGoodsManufacturerPreviousRequest);
router.route('/:id')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsManufacturerPreviousRequestById)
    .put(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), updateGoodsManufacturerPreviousRequest)
    .delete(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), deleteGoodsManufacturerPreviousRequest); 
router.route('/distributor/slug/:slug')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsManufacturerPreviousRequestByMSlug);
router.route('/distributorName/:distributorName')
    .get(authService.verifyToken, authService.allowedTo('manufacturer', 'distributor'), getGoodsManufacturerPreviousRequestByName);
router.route('/distributor/order')
    .get(authService.verifyToken, getGoodsPreviousRequestsforDistributor)

module.exports = router;