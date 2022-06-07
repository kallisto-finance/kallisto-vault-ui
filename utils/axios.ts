import axios from "axios";

const axiosClient = () => {
  const client = axios.create();

  client.defaults.headers.common = {
    "Access-Control-Allow-Origin": "*",
  };

  return client;
};

