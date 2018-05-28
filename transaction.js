const utils = require('./utils');

const {hexStr2byteArray} = require("@tronprotocol/wallet-api/src/lib/code");
const {longToByteArray, byteArray2hexStr} = require("@tronprotocol/wallet-api/src/utils/bytes");
const {decode58Check, SHA256, signTransaction} = require("@tronprotocol/wallet-api/src/utils/crypto");

const google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');
const {TransferContract} = require("./protocol/core/Contract_pb");
const {Transaction, TransactionList, Transfer} = require("./protocol/core/Tron_pb");

function getTransactionHash(transaction){
    let raw = transaction.getRawData();
    let rawBytes = raw.serializeBinary();
    let hashBytes = SHA256(rawBytes);
    return hashBytes;
}

function transactionFromBase64(transactionString){
    return Transaction.deserializeBinary(utils.base64DecodeFromString(transactionString));
}

function transactionListFromBase64(transactionListString){
    return TransactionList.deserializeBinary(utils.base64DecodeFromString(transactionListString));
}

function getBlockInfo(block){
    return {
        number: block.getBlockHeader().getRawData().getNumber(),
        witnessId: block.getBlockHeader().getRawData().getWitnessId(),
        hash: byteArray2hexStr(SHA256(block.getBlockHeader().getRawData().serializeBinary())),
        parentHash: byteArray2hexStr(block.getBlockHeader().getRawData().getParenthash()),
    };
}

async function addRef(transaction, nowBlock) {
    let latestBlock = getBlockInfo(nowBlock);

    let latestBlockHash = latestBlock.hash;
    let latestBlockNum = latestBlock.number;

    let numBytes = longToByteArray(latestBlockNum);
    numBytes.reverse();
    let hashBytes = hexStr2byteArray(latestBlockHash);

    let generateBlockId = [...numBytes.slice(0, 8), ...hashBytes.slice(8, hashBytes.length - 1)];

    let rawData = transaction.getRawData();
    rawData.setRefBlockHash(Uint8Array.from(generateBlockId.slice(8, 16)));
    rawData.setRefBlockBytes(Uint8Array.from(numBytes.slice(6, 8)));
    rawData.setExpiration(Date.now() + (60 * 24 * 1000));

    transaction.setRawData(rawData);
    return transaction;
}

function createTransaction(message, contractType, typeName, nowBlock) {
    let anyValue = new google_protobuf_any_pb.Any();
    anyValue.pack(message.serializeBinary(), "protocol." + typeName);

    let contract = new Transaction.Contract();
    contract.setType(contractType);
    contract.setParameter(anyValue);

    let raw = new Transaction.raw();
    raw.addContract(contract);
    raw.setTimestamp(new Date().getTime() * 1000000);

    let transaction = new Transaction();
    transaction.setRawData(raw);
    transaction = addRef(transaction, nowBlock);

    return transaction;
}

function createUnsignedTransferTransaction(sender, recipient, amount, nowBlock){
    let contract = new TransferContract();
    contract.setOwnerAddress(Uint8Array.from(decode58Check(sender)));
    contract.setToAddress(Uint8Array.from(decode58Check(recipient)));
    contract.setAmount(amount);

    return createTransaction(
        contract,
        Transaction.Contract.ContractType.TRANSFERCONTRACT,
        "TransferContract",
        nowBlock);
}


module.exports = {
    transactionFromBase64,
    transactionListFromBase64,
    createUnsignedTransferTransaction,
    signTransaction,
    getTransactionHash
}