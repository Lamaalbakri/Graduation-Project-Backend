const express = require('express');

const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteRawMaterial,
  getMaterialByName
} = require('../services/ManageRawMaterialService');

// const authService = require("../services/authService")

const router = express.Router();

// router.route('/').get(getMaterials).post(authService.verifyToken, createMaterial);
router.route('/').get(getMaterials).post(createMaterial);
router
  .route('/:id')
  .get(getMaterialById)
  .put(updateMaterial)
  .delete(deleteRawMaterial);
router.route('/materialName/:name').get(getMaterialByName);
module.exports = router;