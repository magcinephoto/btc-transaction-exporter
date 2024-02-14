import { MEMPOOL_URL_BASE, MempoolTransaction, fetchMempoolTransactions } from './mempool';
import { MeActivity, fetchMagicEdenActivities } from './magiceden';

const ORD_ENVELOP_HEADER = 'OP_0 OP_IF OP_PUSHBYTES_3 6f7264 OP_PUSHBYTES_1 01';
const SATS_BTC = 100000000;

type ExportData = {
  timestamp: string;
  txid: string;
  txUrl: string;
  address: string;
  vin: number;
  vout: number;
  vdiff: number;
  myAddress: '*' | '';
  date: string;
  description: string;
  inDiff: number;
  outDiffWithoutFee: number;
  fee: number;
  ordInscriptionNumber: string,
  ordContentType: string;
  ordContentText: string;
  ordInscriptionUrl: string;
};

type txValueByAddress = {
  [address: string]: {
    vin: number,
    vout: number,
    witnessscript: string
  }
};

export type ExportDataCollection = (string | number)[][];

type satributeArray = Array<Array<string>>;

const extractAndCombineStrings = (arr: satributeArray) => {
  return arr.map((subArray: string[]) => subArray.join(' ')).join(' ');
};

const meDescription = (meActivity?: MeActivity) => {
  if(!meActivity) return '';
  const execKind = meActivity.kind ?? '';
  const collectionName = meActivity.collection.name ?? '';
  const tokenMetaName = meActivity.token.meta ? meActivity.token.meta.name ?? '' : '';
  const satributes = meActivity.satributes ? extractAndCombineStrings(meActivity.satributes) : '';

  return `${execKind} inscription ${collectionName} ${tokenMetaName} ${satributes}`;
};

export const generateExportData = async (address: string) => {
  const [mempoolTransactions, meActivities]: [MempoolTransaction[], MeActivity[]] = await Promise.all([
    fetchMempoolTransactions(address),
    fetchMagicEdenActivities(address)
  ]);

  const result: ExportDataCollection = [exportDataHeader()];

  for (const inputData of mempoolTransactions) {
    convertToExportData(inputData, meActivities, address, '', result);
  }

  return result;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hexToUtf8(hex: string) {
  let utf8 = "";
  for (let i = 0; i < hex.length; i += 2) {
    utf8 += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return utf8;
}

function ordContentTextData(witnessscript: string) {
  const contentText = ordEnvelopeText(witnessscript);
  const contentTypeText = ordContentTypeText(witnessscript);
  if(contentText === '' || (contentText && !contentTypeText.includes('text/plain'))) return '';

  const ordContentTextRaw = contentText.split(' ')[4];
  return `"${hexToUtf8(ordContentTextRaw).replace(/"/g, '""')}"`;
}

function ordInscriptionMeUrl(meActivity?: MeActivity) {
  if(!meActivity) return '';
  return `https://magiceden.io/ordinals/item-details/${meActivity.tokenId}`;
}

function ordContentTypeText(witnessscript: string) {
  const contentText = ordEnvelopeText(witnessscript);
  if(contentText === '') return '';

  const ordContentTypeRaw = contentText.split(' ')[1];
  return hexToUtf8(ordContentTypeRaw);
}

function ordEnvelopeText(witnessscript: string) {
  if(!witnessscript || !witnessscript.includes(ORD_ENVELOP_HEADER)) return '';

  return witnessscript.split(ORD_ENVELOP_HEADER)[1]?.trim();
}

const initialExportData = (): ExportData => {
  return {
    timestamp: '',
    txid: '',
    txUrl: '',
    address: '',
    vin: 0,
    vout: 0,
    vdiff: 0,
    myAddress: '',
    date: '',
    description: '',
    inDiff: 0,
    outDiffWithoutFee: 0,
    fee: 0,
    ordInscriptionNumber: '',
    ordContentType: '',
    ordContentText: '',
    ordInscriptionUrl: '',
  }
};

const exportDataHeader = () => {
  const header: ExportData = initialExportData();
  return Object.keys(header);
};

const convertToExportData = (transactionData: MempoolTransaction, meActivities: MeActivity[], mainAddress: string, subAddress: string, result: ExportDataCollection) => {
  const transactionId = transactionData.txid;
  const gasFee = transactionData.fee;
  const blockTime = transactionData.status.block_time;
  const timeStamp = new Date(blockTime * 1000);
  const timeStampString = timeStamp.toLocaleDateString('ja-JP') + ' ' + timeStamp.toLocaleTimeString('ja-JP')
  const date = formatDate(timeStamp);
  const ownAddresses = [mainAddress, subAddress];
  const txValues: txValueByAddress = {};

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
    const txUrl = `${MEMPOOL_URL_BASE}/tx/${transactionId}`
    const diff = txValue.vout - txValue.vin;
    const fee = gasFee;
    const inDiff = diff >= 0 ? diff : 0;
    const outDiff = diff < 0 ? Math.abs(diff) : 0;
    const outDiffWithoutFee = inDiff > 0 ? 0 : Math.abs(outDiff - fee)/SATS_BTC;
    const myAddress = ownAddresses.includes(address) ? '*' : '';
    const ordContentText = ordContentTextData(txValue.witnessscript);
    const meActivity = meActivities.find(elem => elem.txId && elem.txId === transactionId);
    const ordInscriptionUrl = ordInscriptionMeUrl(meActivity);
    const description = meDescription(meActivity);
    const ordContentType = meActivity && meActivity.token ? meActivity.token.contentType : '';
    const ordInscriptionNumber = meActivity && meActivity.token ? meActivity.token.inscriptionNumber : '';

    const exportData: ExportData = {
      timestamp: timeStampString,
      txid: transactionId,
      txUrl: txUrl,
      address: address,
      vin: txValue.vin/SATS_BTC,
      vout: txValue.vout/SATS_BTC,
      vdiff: diff/SATS_BTC,
      myAddress: myAddress,
      date: date,
      description: description,
      inDiff: inDiff/SATS_BTC,
      outDiffWithoutFee: outDiffWithoutFee,
      fee: 0,
      ordInscriptionNumber: ordInscriptionNumber,
      ordContentType: ordContentType,
      ordContentText: ordContentText,
      ordInscriptionUrl: ordInscriptionUrl,
    }

    const gasData = initialExportData();
    gasData.timestamp = timeStampString;
    gasData.txid = transactionId;
    gasData.txUrl = txUrl;
    gasData.address = address;
    gasData.myAddress = myAddress;
    gasData.date = date;
    gasData.description = `GasFee: ${address}`;
    gasData.inDiff = 0;
    gasData.outDiffWithoutFee = 0;
    gasData.fee = fee/SATS_BTC;
    
    if (diff < 0) {
      result.push(Object.values(exportData));
      result.push(Object.values(gasData));
    } else {
      result.push(Object.values(exportData));
    }
  }
};
