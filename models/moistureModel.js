var mongoose = require('mongoose');

//Schéma vlhkosti modelu
var Schema = mongoose.Schema;

var MoistureModelSchema = new Schema({
  sensorID: Number,
  moisture: String,
}, {
    timestamps: true
  });

module.exports = mongoose.model('MoistureModel', MoistureModelSchema);