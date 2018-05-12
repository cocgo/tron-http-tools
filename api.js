const utils = require('./utils');

const {Response} = require("@tronprotocol/wallet-api/src/protocol/api/api_pb");

function responseFromBase64(response){
    return Response.deserializeBinary(utils.base64DecodeFromString(response));
}

module.exports = {
    responseFromBase64
}
