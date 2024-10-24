const Supplier = require('./suppliersModel');
const Transporter = require('./transportersModel');
const Manufacturer = require('./manufacturersModel');
const Distributor = require('./distributorsModel');
const Retailer = require('./retailersModel');

// Helper function to get the appropriate model based on user type
function getModelByUserType(userType) {
    switch (userType) {
      case 'supplier':
        return Supplier;
      case 'transporter':
        return Transporter;
      case 'manufacturer':
        return Manufacturer;
      case 'distributor':
        return Distributor;
      case 'retailer':
        return Retailer;
      default:
        throw new Error('Invalid user type');
    }
}

module.exports = {
    getModelByUserType,
};