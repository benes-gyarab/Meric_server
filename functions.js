const moistureModel = require('./models/moistureModel')
const configModel = require('./models/configModel')

//Najde poslední záznam v databázi pro daný senzor
async function findLatestRecord(id) {
    let moisture = await moistureModel.find({ sensorID: id }).sort({ 'createdAt': -1 }).exec();
    let config = await configModel.findOne({ sensorID: id }).exec();

    return (moisture[0].moisture + ":" + config.wet + ":" + config.dry);

}

module.exports = {
    findLatestRecord
};

