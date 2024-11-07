const express = require('express');
const {
  getMaterials,
  getMaterialForListOfSupplier,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteRawMaterial,
  getMaterialByNameOrId
} = require('../services/ManageRawMaterialService');
const upload = require('../middleware/uploadMiddleware');
const { uploadImageOnCloudinary } = require('../services/cloudinaryUploadController');
const authService = require('../services/authService');

const router = express.Router();

router.route('/get-materials')
  .get(
    authService.verifyToken,
    authService.allowedTo('manufacturer', 'supplier'),
    getMaterials
  );

router.route('/get-specific-material-list')
  .get(
    authService.verifyToken,
    authService.allowedTo('manufacturer'),
    getMaterialForListOfSupplier
  );

router.route('/create-materials')
  .post(
    authService.verifyToken,
    authService.allowedTo('supplier'),
    createMaterial
  );

router.route('/:id')
  .get(
    authService.verifyToken,
    getMaterialById
  );

router.route('/update-material')
  .post(
    authService.verifyToken,
    authService.allowedTo('supplier'),
    updateMaterial
  );

router.route('/delete-material')
  .post(
    authService.verifyToken,
    authService.allowedTo('supplier'),
    deleteRawMaterial
  );

router.route('/image-uploads')
  .post(
    upload.single('image'),
    uploadImageOnCloudinary
  );

router.route('/material/:query')
  .get(
    authService.verifyToken,
    getMaterialByNameOrId
  );

module.exports = router;
