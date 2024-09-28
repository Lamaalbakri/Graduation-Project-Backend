const express = require('express');//import the express library

const { getRawMaterialPreviousRequests,
    createRawMaterialPreviousRequest,
    getRawMaterialPreviousRequestById,
    getRawMaterialPreviousRequestByMSlug,
    updateRawMaterialPreviousRequest,
    deleteRawMaterialPreviousRequest
} = require('../services/rowMaterialPreviousRequestService');


const router = express.Router();

//Routes
router.route('/').get(getRawMaterialPreviousRequests).post(createRawMaterialPreviousRequest);
router.route('/:id').get(getRawMaterialPreviousRequestById).put(updateRawMaterialPreviousRequest).delete(deleteRawMaterialPreviousRequest); // Define a special path for ObjectId
router.route('/manufacturer/slug/:slug').get(getRawMaterialPreviousRequestByMSlug); // Path to search for manufacturer slug


module.exports = router;