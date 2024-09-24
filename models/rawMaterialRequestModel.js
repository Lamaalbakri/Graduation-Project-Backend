const mongoose = require('mongoose');//import mongoose 

//1-create schema 
const RawMaterialRequestSchema = new mongoose.Schema({
    name: String,

});

//2- create model
const RawMaterialRequestModel = mongoose.model('RawMaterialRequest', RawMaterialRequestSchema);

module.exports = RawMaterialRequestModel;