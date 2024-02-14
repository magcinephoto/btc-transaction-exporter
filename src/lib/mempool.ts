import { getRequest, sleep } from './client';

export const MEMPOOL_URL_BASE = 'https://mempool.space';

type VinElement = {
  prevout: {
      scriptpubkey_address: string;
      value: number;
  };
  inner_witnessscript_asm?: string;
};

type VoutElement = {
  scriptpubkey_address: string;
  value: number;
};

export type MempoolTransaction = {
  txid: string;
  fee: number;
  status: {
    block_time: number;
  };
  vin: VinElement[];
  vout: VoutElement[];
};

export async function fetchMempoolTransactions(address: string) {
  const result: MempoolTransaction[] = [];
  const initialResponse: MempoolTransaction[] = await getRequest(`${MEMPOOL_URL_BASE}/api/address/${address}/txs`);
  if (initialResponse.length === 0) {
    return result;
  }

  let lastSeenTxid = initialResponse.at(-1)!.txid
  result.push(...initialResponse);

  if (result.length < 25) {
    return result;
  }

  while (lastSeenTxid) {
    const chainResponse: MempoolTransaction[] = await getRequest(`${MEMPOOL_URL_BASE}/api/address/${address}/txs/chain/${lastSeenTxid}`);
    result.push(...chainResponse);

    if (chainResponse.length === 0 || chainResponse.length < 25) {
      break;
    }

    lastSeenTxid = chainResponse.at(-1)!.txid;
    await sleep(1000);
  }
  return result;
}
