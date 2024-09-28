const AssignTransporModal = require('../models/assignTransporterModel');

exports.createTransportRequest = async (req, res) => {

    console.log("Received request body:", req.body); // تأكد من وصول البيانات

    try {
      const { temperature, weight, distance, company, dateRange, departureCity } = req.body;
  
      // Validate input
      if (!temperature || !weight || !distance || !departureCity || !dateRange || !company) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Create new transport request
      const newRequest = new AssignTransporModal({
        temperature,
        weight,
        distance,
        company,
        dateRange,
        departureCity,
      });
  
      // Save to database
      await newRequest.save();
      res.status(201).json({ message: 'Transport request created successfully!' });

    } catch (error) {
      console.error("Error in POST /transportRequest:", error); // سجل أي أخطاء
      res.status(500).json({ message: 'Server error' });
    }
}