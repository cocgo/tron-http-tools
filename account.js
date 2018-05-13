const utils = require('./utils');
const bip39 =  require('bip39');

const {Account} = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");
const {privateKeyToAddress} = require("@tronprotocol/wallet-api/src/utils/crypto");


function accountFromBase64(accountString){
    return Account.deserializeBinary(utils.base64DecodeFromString(accountString));
}

function accountFromMnemonicString(mnemonic){
    let words = mnemonic.split(" ");
    let privateKey = bip39.mnemonicToSeedHex(mnemonic);
    let address = privateKeyToAddress(privateKey);

    return {
        words,
        privateKey,
        address
    };

}

function generateRandomBip39(){
    let mnemonic = bip39.generateMnemonic(256);
    return accountFromMnemonicString(mnemonic);
}

module.exports = {
    accountFromBase64,
    privateKeyToAddress,
    generateRandomBip39,
    accountFromMnemonicString
}