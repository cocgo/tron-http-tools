const utils = require('./utils');

const {Account} = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");
const {privateKeyToAddress} = require("@tronprotocol/wallet-api/src/utils/crypto");


function accountFromBase64(accountString){
    return Account.deserializeBinary(utils.base64DecodeFromString(accountString));
}

module.exports = {
    accountFromBase64,
    privateKeyToAddress
}