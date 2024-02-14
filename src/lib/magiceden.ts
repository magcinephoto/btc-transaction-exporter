import { getRequest, sleep } from './client';

type MeCollection = {
  symbol: string;
  name: string;
  imageURI: string;
  chain: string;
  labels: [];
};

type MeTokenMeta = {
  name: string;
};

type MeToken = {
  inscriptionNumber: string;
  contentURI: string;
  contentType: string;
  contentBody: string;
  contentPreviewURI: string;
  meta: MeTokenMeta;
  satRarity: string;
  satBlockHeight: number;
  satBlockTime: string;
  domain: null;
};

export type MeActivity = {
  kind: string;
  tokenId: string;
  chain: string;
  collectionSymbol: string | null;
  collection: MeCollection;
  token: MeToken;
  createdAt: string;
  tokenInscriptionNumber: number;
  listedPrice: number;
  oldLocation: string;
  newLocation: string;
  oldOwner: string;
  newOwner: string;
  txValue: number;
  txId: string;
  txBlockTime: string;
  sellerPaymentReceiverAddress: string | null;
  buyerPaymentAddress: string | null;
};

export const fetchMagicEdenActivities = async (address: string): Promise<MeActivity[]> => {
  let offset = 0;
  const endpoint = `https://api-mainnet.magiceden.io/v2/ord/btc/activities?limit=100&ownerAddress=${address}`;
  const postfix = "&kind[]=buying_broadcasted&kind[]=mint_broadcasted&kind[]=list&kind[]=delist&kind[]=create&kind[]=transfer&kind[]=offer_placed&kind[]=offer_cancelled&kind[]=offer_accepted_broadcasted&kind[]=utxo_invalidated&kind[]=utxo_split_broadcasted&kind[]=utxo_extract_broadcasted";
  let requestUrl = `${endpoint}&offset=${offset}${postfix}`;
  const results: MeActivity[] = [];

  let response = await getRequest(requestUrl);
  let activities = response.activities;

  while (activities.length > 0) {
    results.push(...activities);

    offset += 100;
    requestUrl = `${endpoint}&offset=${offset}${postfix}`;
    await sleep(500);

    response = await getRequest(requestUrl);
    activities = response.activities;
  }

  return results;
}
