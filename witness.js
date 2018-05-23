const utils = require('./utils');

const {WitnessList} = require("@tronprotocol/wallet-api/src/protocol/api/api_pb");
const {Witness} = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");
const {SHA256} = require("@tronprotocol/wallet-api/src/utils/crypto");

function witnessesFromWitnessListBase64(witnesslist){
    let witnesses = WitnessList.deserializeBinary(utils.base64DecodeFromString(witnesslist)).getWitnessesList();
    let output = []
    for (var i = 0;i<witnesses.length;i++){
        let witness = witnesses[i];
        output.push(witness.toObject());
    }
    return output;
}

module.exports = {
    witnessesFromWitnessListBase64
}
