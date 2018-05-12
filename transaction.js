const utils = require('./utils');

const {Transaction} = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");

function transactionFromBase64(transactionString){
    return Transaction.deserializeBinary(utils.base64DecodeFromString(transactionString));
}

module.exports = {
    transactionFromBase64
}