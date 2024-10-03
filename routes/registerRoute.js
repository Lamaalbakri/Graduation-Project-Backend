const express = require("express");
const router = express.Router();
const transportersService = require("../services/transportersService");
const suppliersService = require("../services/suppliersService");
const manufacturersService = require("../services/manufacturersService");
const distributorsService = require("../services/distributorsService");
const retailersService = require("../services/retailersService");

router.route('/register').post(async (req, res) => {
  const { userType } = req.body;

  try {
    let result;
    switch (userType) {
      case "transporter":
        result = await transportersService.registerTransporter(req.body);
        break;
      case "supplier":
        result = await suppliersService.registerSupplier(req.body);
        break;
      case "manufacturer":
        result = await manufacturersService.registerManufacturer(req.body);
        break;
      case "distributor":
        result = await distributorsService.registerDistributor(req.body);
        break;
      case "retailer":
        result = await retailersService.registerRetailer(req.body);
        break;
      default:
        return res.status(400).json({ error: "Invalid user type." });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

