const express = require('express');
const { 
    getGoodsForListOfDistributor,
    getGoods,
    getGoodsById,
    getGoodsByNameOrId,
    createGoods,
    updateGoods,
    deleteGoods
} = require('../services/ManageGoodsDistributorService');
const upload = require('../middleware/uploadMiddleware');
const { uploadImageOnCloudinary } = require('../services/cloudinaryUploadController');
const authService = require('../services/authService');
const router = express.Router();

router.route('/getDistributorGoods')
  .get(
    authService.verifyToken,
    authService.allowedTo('retailer', 'distributor'),
    getGoods
);
router.route('/getSpecificDistributorGoodsList')
  .get(
    authService.verifyToken,
    authService.allowedTo('retailer'),
    getGoodsForListOfDistributor
);
router.route('/createDistributorGoods')
  .post(
    authService.verifyToken,
    authService.allowedTo('distributor'),
    createGoods
);
router.route('/:id')
  .get(
    authService.verifyToken,
    getGoodsById
);
router.route('/updateDistributorGoods')
  .post(
    authService.verifyToken,
    authService.allowedTo('distributor'),
    updateGoods
);
router.route('/deleteDistributorGoods')
  .post(
    authService.verifyToken,
    authService.allowedTo('distributor'),
    deleteGoods
);
router.route('/image-uploads')
  .post(
    upload.single('image'),
    uploadImageOnCloudinary
);
router.route('/goods/:query')
  .get(
    authService.verifyToken,
    getGoodsByNameOrId
);

module.exports = router;