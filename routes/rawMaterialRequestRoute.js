const express = require('express');//import the express library

const { getRawMaterialRequests,
    createRawMaterialRequest,
    getRawMaterialRequestById,
    getRawMaterialRequestByMSlug,
    updateRawMaterialRequest,
    deleteRawMaterialRequest
} = require('../Services/rowMaterialRequestService');


const router = express.Router();

//Routes
router.route('/').get(getRawMaterialRequests).post(createRawMaterialRequest);
router.route('/:id').get(getRawMaterialRequestById).put(updateRawMaterialRequest).delete(deleteRawMaterialRequest); // Define a special path for ObjectId
router.route('/manufacturer/slug/:slug').get(getRawMaterialRequestByMSlug); // Path to search for manufacturer slug


module.exports = router;