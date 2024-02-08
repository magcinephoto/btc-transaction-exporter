import { getRequest } from './client';

const URL_BASE = 'https://mempool.space';
const SATS_BTC = 100000000;

interface VinElement {
  prevout: {
      scriptpubkey_address: string;
      value: number;
  };
  inner_witnessscript_asm?: string;
}

interface VoutElement {
  scriptpubkey_address: string;
  value: number;
}

interface TransactionData {
  txid: string;
  fee: number;
  status: {
    block_time: number;
  };
  vin: VinElement[];
  vout: VoutElement[];
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function fetchMempoolTransactions(address: string) {
  const result: any[] = [];
  const initialResponse: TransactionData[] = await getRequest(`${URL_BASE}/api/address/${address}/txs`);
  if (initialResponse.length === 0) {
    return result;
  }

  let lastSeenTxid = initialResponse.at(-1)!.txid
  result.push(...initialResponse);

  if (result.length < 25) {
    return result;
  }

  while (lastSeenTxid) {
    const chainResponse: TransactionData[] = await getRequest(`${URL_BASE}/api/address/${address}/txs/chain/${lastSeenTxid}`);
    result.push(...chainResponse);

    if (chainResponse.length === 0 || chainResponse.length < 25) {
      break;
    }

    lastSeenTxid = chainResponse.at(-1)!.txid;
    await sleep(1000);
  }
  return result;
}

export const targetMempoolTransactionValues = async (address: string) => {
  const transactions = await fetchMempoolTransactions(address);
  const keys = "timestamp,tx,address,vin,vout,diff".split(',')

  let result: any[] = [];
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
