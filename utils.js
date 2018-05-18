const {hexStr2byteArray, base64EncodeToString, base64DecodeFromString} = require("@tronprotocol/wallet-api/src/lib/code");
const base58 = require('@tronprotocol/wallet-api/src/lib/base58');
const TextDecoder = require('text-encoding').TextDecoder;
const btoa = require("btoa");

function base58AddressToUint8Array(address){
    let decoded = base58.decode58(address);
    let check = decoded.splice(-4, 4);
    return new Uint8Array(decoded);
}

function base64StringToString(b64){
    return Buffer.from(result.message, 'base64').toString();
}

function uint8ToBase64(u){
    console.log(TextDecoder);

    var decoder = new TextDecoder('utf8');
    var b64encoded = btoa(decoder.decode(u8));
    return b64encoded;
}

module.exports = {
    hexStr2byteArray,
    base64EncodeToString,
    base64DecodeFromString,
    base64StringToString,
    base58AddressToUint8Array,
    uint8ToBase64
}
