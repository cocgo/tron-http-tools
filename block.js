const utils = require('./utils');

const {Block} = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");
const {SHA256} = require("@tronprotocol/wallet-api/src/utils/crypto");

function getBlockHash(block){
    let raw = block.getBlockHeader().getRawData();
    let rawBytes = raw.serializeBinary();
    let hashBytes = SHA256(rawBytes);
    return hashBytes;
}
function blockFromBase64(blockString){
    return Block.deserializeBinary(utils.base64DecodeFromString(blockString));
}

module.exports = {
    blockFromBase64,
    getBlockHash
}
