const utils = require('./utils');

const {Block} = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");

function blockFromBase64(blockString){
    return Block.deserializeBinary(utils.base64DecodeFromString(blockString));
}

module.exports = {
    blockFromBase64
}
