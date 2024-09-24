const RawMaterialRequestModel = require('../models/RawMaterialRequestModel');

exports.getRawMaterialRequest = (req, res) => {
    const name = req.body.name;
    console.log(req.body);

    const newRawMaterialRequest = new RawMaterialRequestModel({ name });
    newRawMaterialRequest.save().then((doc) => {
        res.json(doc);
    }).catch((err) => {
        res.json(err);
    });
};