const { getModelByUserType } = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const FeedbackModel = require("../models/FeedbackModel");


exports.getFeedback = asyncHandler(async (req, res) => {
  const userType = req.user.userType;// Get user type from the token
  const userId = req.user._id;

  const feedback = await FeedbackModel.find({ to_id: userId }).populate(
    "from_id"
  );

  // If the address is not found, return an error
  if (!feedback) {
    return res
      .status(404)
      .json({ msg: `No feedback found for this ID: ${id}` });
  }


  res.status(200).json({ data: feedback });
});

// @desc Create a feedback for the authenticated user
// @route POST /api/v1/feedback
// @access Private
exports.createFeedback = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.userType;// Get user type from the token

  const newFeedback = await FeedbackModel.create(req.body);


  res
    .status(201)
    .json({ msg: "Feedback created successfully", data: newFeedback });
});

exports.getBuyerFeedback = asyncHandler(async (req, res) => {
  const userType = req.user.userType; // Get user type from the token
  const userId = req.user._id;

  const feedback = await FeedbackModel.find({ from_id: userId })

  // If the address is not found, return an error
  if (!feedback) {
    return res
      .status(404)
      .json({ msg: `No feedback found for this ID: ${id}` });
  }

  // Return the address data
  res.status(200).json({ data: feedback });
});
