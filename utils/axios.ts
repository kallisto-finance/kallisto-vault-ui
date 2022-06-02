import axios from "axios";

import { addresses } from "./constants";

const axiosClient = () => {
  const client = axios.create();

  client.defaults.headers.common = {
    "Access-Control-Allow-Origin": "*",
  };

  return client;
};

const getGasPrices = () =>
  axiosClient().get(`${addresses.fcdEndPoint}/txs/gas_prices`);

const getTxHistories = async (address, offset = 0, limit = 100) => {
  const res = await fetch(`${addresses.fcdEndPoint}/txs?offset=${offset}&limit=${limit}&account=${address}`);
  // const res = await fetch(`https://terra-services.kallisto.finance/v1/txs?offset=${offset}&limit=${limit}&account=${address}`);
  const json = await res.json();

  return json;
}

export { getGasPrices, getTxHistories };
