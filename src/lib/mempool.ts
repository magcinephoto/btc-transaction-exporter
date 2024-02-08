import { getRequest } from './client.ts'
import * as fs from 'fs';
//import readline from 'readline';

const URL_BASE = 'https://mempool.space';
const SATS_BTC = 100000000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export async function fetchMempoolTransactions(address: string) {
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

//const rl = readline.createInterface({
//  input: process.stdin,
//  output: process.stdout
//});


//const init = async (walletAlias: string, mainAddress: string, subAddress: string) => {
//  const transactions = await fetchMempoolTransactions(mainAddress);
//  const jsonData = JSON.stringify(transactions, null, 2);
//
//  const outputFileName = `dist/${walletAlias}_${mainAddress}.json`;
//  const fileStream = fs.createWriteStream(outputFileName);
//
//  fs.writeFile(outputFileName, jsonData, (err) => {
//    if (err) throw err; // 書き込み中にエラーが発生した場合、例外を投げます
//    console.log('The file has been saved!');
//  });
//};
//
//rl.question('Wallet alias: ', (walletAlias) => {
//  rl.question('Main BTC address: ', (mainAddress) => {
//    rl.question('Sub BTC address(optional): ', (subAddress) => {
//      init(walletAlias, mainAddress, subAddress);
//      rl.close();
//    });
//  });
//});
