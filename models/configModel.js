var mongoose = require('mongoose');

//Schéma konfiguračního modelu
var Schema = mongoose.Schema;

var ConfigModelSchema = new Schema({
  sensorID: Number,
  dry: {
      type: Number,
      default: 100,
        },
  wet:{
    type: Number,
    default: 700,
  }},
   {
  timestamps: true
});

module.exports = mongoose.model('ConfigModel', ConfigModelSchema );