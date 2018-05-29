const assert = require('assert');
const utils = require('./utils');

const {hexStr2byteArray} = require("@tronprotocol/wallet-api/src/lib/code");
const {longToByteArray, byteArray2hexStr} = require("@tronprotocol/wallet-api/src/utils/bytes");
const {decode58Check, SHA256, signTransaction} = require("@tronprotocol/wallet-api/src/utils/crypto");

const google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');
const {UnfreezeBalanceContract, FreezeBalanceContract, TransferContract, AssetIssueContract} = require("./protocol/core/Contract_pb");
const {Transaction, TransactionList, Transfer} = require("./protocol/core/Tron_pb");

function getTransactionHash(transaction){
    let raw = transaction.getRawData();
    let rawBytes = raw.serializeBinary();
    return SHA256(rawBytes);
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

function createUnsignedTransferTransaction(props, nowBlock){
    assert.notEqual(undefined, props.sender);
    assert.notEqual(undefined, props.recipient);
    assert.notEqual(undefined, props.amount);

    let contract = new TransferContract();
    contract.setOwnerAddress(Uint8Array.from(decode58Check(props.sender)));
    contract.setToAddress(Uint8Array.from(decode58Check(props.recipient)));
    contract.setAmount(props.amount);

    return createTransaction(
        contract,
        Transaction.Contract.ContractType.TRANSFERCONTRACT,
        "TransferContract",
        nowBlock);
}

function createUnsignedAssetIssueTransaction(props, nowBlock){
    assert.notEqual(undefined, props.sender);
    assert.notEqual(undefined, props.assetName);
    assert.notEqual(undefined, props.assetAbbr);
    assert.notEqual(undefined, props.totalSupply);
    assert.notEqual(undefined, props.num);
    assert.notEqual(undefined, props.trxNum);
    assert.notEqual(undefined, props.endTime);
    assert.notEqual(undefined, props.startTime);
    assert.notEqual(undefined, props.description);
    assert.notEqual(undefined, props.url);


    let contract = new AssetIssueContract();
    contract.setOwnerAddress(Uint8Array.from(decode58Check(props.sender)));
    contract.setName(utils.stringToUint8Array(props.assetName));
    contract.setAbbr(utils.stringToUint8Array(props.assetAbbr));
    contract.setTotalSupply(props.totalSupply);
    contract.setNum(props.num);
    contract.setTrxNum(props.trxNum);
    contract.setEndTime(props.endTime);
    contract.setStartTime(props.startTime);
    contract.setDescription(utils.stringToUint8Array(props.description));
    contract.setUrl(utils.stringToUint8Array(props.url));

    return createTransaction(
        contract,
        Transaction.Contract.ContractType.ASSETISSUECONTRACT,
        "AssetIssueContract",
        nowBlock
    );
}

function createUnsignedFreezeBalanceTransaction(props, nowBlock){
    assert.notEqual(undefined, props.ownerAddress);
    assert.notEqual(undefined, props.amount);
    assert.notEqual(undefined, props.duration);
    props.duration = 3000000000000;

    console.log(props);

    console.log('here: ' + props.ownerAddress);
    let contract = new FreezeBalanceContract();
    contract.setOwnerAddress(Uint8Array.from(decode58Check(props.ownerAddress)));
    contract.setFrozenBalance(props.amount);
    contract.setFrozenDuration(props.duration);

    return createTransaction(
        contract,
        Transaction.Contract.ContractType.FREEZEBALANCECONTRACT,
        "FreezeBalanceContract",
        nowBlock
    );
}

function createUnsignedUnfreezeBalanceTransaction(props, nowBlock){
    assert.notEqual(undefined, props.ownerAddress);

    let contract = new UnfreezeBalanceContract();
    contract.setOwnerAddress(Uint8Array.from(decode58Check(props.ownerAddress)));

    return createTransaction(
        contract,
        Transaction.Contract.ContractType.FREEZEBALANCECONTRACT,
        "UnfreezeBalanceContract",
        nowBlock
    );
}

module.exports = {
    transactionFromBase64,
    transactionListFromBase64,
    createUnsignedTransferTransaction,
    createUnsignedAssetIssueTransaction,
    createUnsignedFreezeBalanceTransaction,
    createUnsignedUnfreezeBalanceTransaction,
    signTransaction,
    getTransactionHash
}