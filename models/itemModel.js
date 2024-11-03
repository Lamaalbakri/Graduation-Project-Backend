const RawMaterialModel = require("../models/ManageRawMaterialModel");

// Helper function to get the appropriate model based on user type
function getItemModelByUserType(userType) {
    switch (userType) {
        case 'manufacturer':
            return RawMaterialModel;
        // case 'distributor':
        //   return "نحط اسم موديل منتجات المصنع";
        // case 'retailer':
        //   return "نحط اسم موديل منتجات المصنع او الديستربيوتر";
        default:
            throw new Error('Invalid user type');
    }
}

module.exports = {
    getItemModelByUserType,
};