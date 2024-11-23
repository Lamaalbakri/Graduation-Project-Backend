const RawMaterialModel = require("../models/ManageRawMaterialModel");
const ManufacturedGoodsModel = require('../models/ManageGoodsManufacturerModel');
const DistributoredGoodsModel = require('../models/ManageGoodsDistributorModel');

// Helper function to get the appropriate model based on user type
function getItemModelByUserType(userType) {
    switch (userType) {
        case 'manufacturer':
            return RawMaterialModel;
        case 'distributor':
           return ManufacturedGoodsModel;
        case 'retailer':
           return DistributoredGoodsModel;
        default:
            throw new Error('Invalid user type');
    }
}

module.exports = {
    getItemModelByUserType,
};