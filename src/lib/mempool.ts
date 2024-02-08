import { getRequest } from './client.ts'
import * as fs from 'fs';

const URL_BASE = 'https://mempool.space';
const SATS_BTC = 100000000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

function formatDate(date: Date) {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function fetchMempoolTransactions(address: string) {
  const result: any[] = [];
  const initialResponse = await getRequest(`${URL_BASE}/api/address/${address}/txs`);
  if (initialResponse.length === 0) {
    return result;
  }

  let lastSeenTxid = initialResponse.at(-1).txid;
  result.push(...initialResponse);

  if (result.length < 25) {
    return result;
  }

  while (lastSeenTxid) {
    const chainResponse = await getRequest(`${URL_BASE}/api/address/${address}/txs/chain/${lastSeenTxid}`);
    result.push(...chainResponse);

    if (chainResponse.length === 0 || chainResponse.length < 25) {
      break;
    }

    lastSeenTxid = chainResponse.at(-1).txid;
    await sleep(1000);
  }
  return result;
}

export const targetMempoolTransactions = async (address: string) => {
  const transactions = await fetchMempoolTransactions(address);
  //const fileStream = fs.createWriteStream(outputFileName, {encoding: 'utf8'});
  //fileStream.write('timestamp,tx,address,vin,vout,diff,myaddress,date,description,indiff,outdiff/gasfee,ordContentType,ordContentText,ordInscriptionUrl\n');

  const keys = "timestamp,tx,address,vin,vout,diff".split(',')

  let result = [];
  for (const inputData of transactions) {
    convertTransactionData(inputData, address, '', result);
  }

  return result;
}

const convertTransactionData = (transactionData: any, mainAddress: string, subAddress: string, result: any[]) => {
  const transactionId = transactionData.txid;
  const gasFee = transactionData.fee;
  const blockTime = transactionData.status.block_time;
  const timeStamp = new Date(blockTime * 1000);
  const timeStampString = timeStamp.toLocaleDateString('ja-JP') + ' ' + timeStamp.toLocaleTimeString('ja-JP')
  const date = formatDate(timeStamp);
  const ownAddresses = [mainAddress, subAddress];
  const txValues: { [address: string]: { vin: number, vout: number, witnessscript: string } } = {};

  for (const vinElem of transactionData.vin) {
    const address = vinElem.prevout.scriptpubkey_address;
    const value = vinElem.prevout.value;
    const witnessscript = vinElem.inner_witnessscript_asm;

    if (!txValues[address]) {
      txValues[address] = { vin: 0, vout: 0, witnessscript: '' };
    }

    txValues[address].vin += value;
    txValues[address].witnessscript = witnessscript ? witnessscript : '';
  }

  for (const voutElem of transactionData.vout) {
    const address = voutElem.scriptpubkey_address;
    const value = voutElem.value;

    if (!txValues[address]) {
      txValues[address] = { vin: 0, vout: 0, witnessscript: '' };
    }

    txValues[address].vout += value;
  }

  for (const address of Object.keys(txValues)) {
    const txValue = txValues[address];
    const txUrl = `${URL_BASE}/tx/${transactionId}`
    const diff = txValue.vout - txValue.vin;
    const inDiff = diff >= 0 ? diff : 0;
    const outDiff = diff < 0 ? Math.abs(diff) : 0;
    const fee = gasFee;
    const myAddress = ownAddresses.includes(address) ? 'O' : '';
    //const ordContentType = ordContentTypeText(txValue.witnessscript);
    //const ordContentText = ordContentTextData(txValue.witnessscript);
    //const ordInscriptionUrl = ordInscriptionMEUrl(transactionId, txValue.witnessscript);

    if (fee > 0 && address === mainAddress && diff < 0) {
      //const gasDescription = `GasFee: ${description}`;
      result.push([
        timeStampString,
        txUrl,
        address,
        txValue.vin/SATS_BTC,
        txValue.vout/SATS_BTC,
        diff/SATS_BTC,
        myAddress,
        date,
        inDiff/SATS_BTC,
        (outDiff - fee)/SATS_BTC,
      ]);
      //fileStream.write(`${timeStampString},${txUrl},${address},,,,${myAddress},${date},${gasDescription},${0},${fee/SATS_BTC}\n`);
    } else {
      result.push([
        timeStampString,
        txUrl,
        address,
        txValue.vin/SATS_BTC,
        txValue.vout/SATS_BTC,
        diff/SATS_BTC,
        myAddress,
        date,
        inDiff/SATS_BTC,
        (outDiff - fee)/SATS_BTC,
      ]);
    }
  }
};
