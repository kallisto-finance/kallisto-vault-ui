import axios from "axios";

const apiBase = process.env.KALLISTO_VAULT_API_BASE;

const axiosClient = () => {
  const client = axios.create();
  
  return client;
};

export const fetchCurveVaultValues = async () => {
  const res = await axiosClient().get(`${apiBase}/api/v1/vault/curve`);
  if (res.status === 200) {
    console.log(res.data);
    return res.data;
  }

  return null;
}
