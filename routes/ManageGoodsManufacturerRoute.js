const express = require('express');
const { 
    getGoodsForListOfManufacturer,
    getGoods,
    getGoodsById,
    getGoodsByNameOrId,
    createGoods,
    updateGoods,
    deleteGoods
} = require('../services/ManageGoodsManufacturerService');
const upload = require('../middleware/uploadMiddleware');
const { uploadImageOnCloudinary } = require('../services/cloudinaryUploadController');
const authService = require('../services/authService');
const router = express.Router();

router.route('/getManufacturerGoods')
  .get(
    authService.verifyToken,
    authService.allowedTo('distributor', 'manufacturer'),
    getGoods
);
router.route('/getSpecificManufacturerGoodsList')
  .get(
    authService.verifyToken,
    authService.allowedTo('distributor'),
    getGoodsForListOfManufacturer
);
router.route('/createManufacturerGoods')
  .post(
    authService.verifyToken,
    authService.allowedTo('manufacturer'),
    createGoods
);
router.route('/:id')
  .get(
    authService.verifyToken,
    getGoodsById
);
router.route('/updateManufacturerGoods')
  .post(
    authService.verifyToken,
    authService.allowedTo('manufacturer'),
    updateGoods
);
router.route('/deleteManufacturerGoods')
  .post(
    authService.verifyToken,
    authService.allowedTo('manufacturer'),
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