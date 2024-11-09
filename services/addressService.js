const { getModelByUserType } = require('../models/userModel');
const asyncHandler = require('express-async-handler')
const AddressModel = require('../models/addressSchema');

// @desc Get Specific Address by user ID for authorized User
// @route GET /api/v1/addresses/:id
// @access Private
exports.getAddressByUserId = asyncHandler(async (req, res) => {
    //const { id } = req.params; // Get the user ID from the route parameters
    const userType = req.user.userType; // Get user type from the token
    const userId = req.user._id; // Get user ID from the token

    // // Validate that the ID is provided
    // if (!id || id.trim() === '') {
    //     return res.status(400).json({ msg: 'ID is required.' });
    // }

    // Find the address by ID, ensuring it belongs to the authenticated user
    const address = await AddressModel.findOne({ user_id: userId, user_type: userType });

    // If the address is not found, return an error
    if (!address) {
        return res.status(404).json({ msg: `No address found for this ID: ${id}` });
    }

    // Return the address data
    res.status(200).json({ data: address });
});


// @desc Create a new address for the authenticated user
// @route POST /api/v1/addresses
// @access Private
/**
 * This method will change when the project is expanded 
 * and will allow the creation of more than one address for each user. 
 * Based on this, the interfaces will allow the user to choose between several addresses.
 */
exports.createAddress = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Retrieve user ID from token
    const userType = req.user.userType; // Retrieve user type from token
    const { street, city, neighborhood, postal_code, country, is_default } = req.body;

    // Find the appropriate model based on user type
    const UserModel = getModelByUserType(userType);

    // Check if the user already has an address
    const existingAddress = await AddressModel.findOne({ user_id: userId });

    if (existingAddress) {
        // If an address already exists, return a message indicating that a new address cannot be created
        return res.status(400).json({ msg: 'You already have an address. You cannot create another one.' });
    }

    // Create a new address and link it to the authenticated user
    const newAddress = await AddressModel.create({
        user_id: userId,
        user_type: userType,
        street,
        city,
        neighborhood,
        postal_code,
        country,
        is_default
    });

    // Update the user's addresses list with the new address ID
    await UserModel.findByIdAndUpdate(
        userId,
        { $addToSet: { addresses: newAddress._id } }, // استخدم $addToSet لتجنب التكرار
        { new: true }
    );

    // Respond with the newly created address
    res.status(201).json({ msg: 'Address created successfully', data: newAddress });
});


// @desc Update an existing address for the authenticated user
// @route PUT /api/v1/addresses/:id
// @access Private
exports.updateAddress = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the address ID from the route parameters
    const userId = req.user._id; // Retrieve user ID from token
    const userType = req.user.userType; // Retrieve user type from token
    const { street, city, neighborhood, postal_code, country, is_default } = req.body;

    // Validate that the ID is provided
    if (!id || id.trim() === '') {
        return res.status(400).json({ msg: 'ID is required.' });
    }

    // Update the address only if it belongs to the authenticated user
    const updatedAddress = await AddressModel.findOneAndUpdate(
        { _id: id, user_id: userId, user_type: userType },
        { street, city, neighborhood, postal_code, country, is_default },
        { new: true }
    );

    // If no matching address is found, return an error
    if (!updatedAddress) {
        return res.status(404).json({ msg: 'Address not found or unauthorized.' });
    }

    // Respond with the updated address
    res.status(200).json({ msg: 'Address updated successfully', data: updatedAddress });
});
