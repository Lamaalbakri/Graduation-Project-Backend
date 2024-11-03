// const express = require('express');

// const {
//   getMaterials,
//   getMaterialById,
//   createMaterial,
//   updateMaterial,
//   deleteRawMaterial,
//   getMaterialByName
// } = require('../services/ManageRawMaterialService');

const authService = require("../services/authService")

// const router = express.Router();

// // router.route('/').get(getMaterials).post(authService.verifyToken, createMaterial);
// router.route('/').get(getMaterials).post(createMaterial);
// router
//   .route('/:id')
//   .get(getMaterialById)
//   .put(updateMaterial)
//   .delete(deleteRawMaterial);
// router.route('/materialName/:name').get(getMaterialByName);
// module.exports = router;

const express = require('express');

const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteRawMaterial,
  getMaterialByNameOrId
} = require('../services/ManageRawMaterialService');
const upload = require('../middleware/uploadMiddleware');
const { uploadImageOnCloudinary } = require('../services/cloudinaryUploadController');

const router = express.Router();

// // router.route('/').get(getMaterials).post(authService.verifyToken, createMaterial);

// created single route then previous one.it is easy to maintain
//router.route('/get-materials').get(authService.verifyToken, authService.allowedTo('supplier'), getMaterials);
router.route('/').get(authService.verifyToken, authService.allowedTo('supplier','manufacturer'), getMaterials);

router.route('/create-materials').post(authService.verifyToken, authService.allowedTo('supplier'), createMaterial);

router.route('/:id').get(authService.verifyToken, authService.allowedTo('supplier','manufacturer'), getMaterialById);
router.route('/update-material').post(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), updateMaterial);
router.route('/delete-material').post(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), deleteRawMaterial);
router.route("/image-uploads").post(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), upload.single("image"), uploadImageOnCloudinary);

router.route('/material/:query').get(authService.verifyToken, authService.allowedTo('supplier', 'manufacturer'), getMaterialByNameOrId);
module.exports = router;
