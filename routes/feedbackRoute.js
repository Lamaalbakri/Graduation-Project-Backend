const express = require("express");
const authService = require("../services/authService");
const { createFeedback, getFeedback, getBuyerFeedback, } = require("../services/feedbackService");

const router = express.Router();


router
  .route("/")
  .get(
    authService.verifyToken,
    authService.allowedTo(
      "supplier",
      "manufacturer",
      "distributor"
    ),
    getFeedback
  )
  .post(
    authService.verifyToken,
    authService.allowedTo(
      "manufacturer",
      "distributor",
      "retailer"
    ),
    createFeedback
  );

router.route("/buyer-feedback").get(
  authService.verifyToken,
  authService.allowedTo(
    "manufacturer",
    "distributor",
    "retailer"
  ),
  getBuyerFeedback
);
module.exports = router; 
