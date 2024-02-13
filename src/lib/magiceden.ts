import { getRequest } from './client';

export const fetchMagicEdenData = async () => {
  const url = "https://api-mainnet.magiceden.io/v2/ord/btc/activities?limit=100&offset=0&ownerAddress=bc1phcgy4v0ef3pehn6zrlgnp74fjrzm758rt3mcmk5vhm2lpscgq72q9fpnrz&kind[]=buying_broadcasted&kind[]=mint_broadcasted&kind[]=list&kind[]=delist&kind[]=create&kind[]=transfer&kind[]=offer_placed&kind[]=offer_cancelled&kind[]=offer_accepted_broadcasted&kind[]=utxo_invalidated&kind[]=utxo_split_broadcasted&kind[]=utxo_extract_broadcasted";
  const histories = await getRequest(url);
  return histories;
}
