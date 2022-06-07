import { useState, useEffect } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

import { useWallet } from "./useWallet";
import { TOKENS, VETH } from "utils/constants";

import ERC20_ABI from "../abis/erc20.json";

const useBalance = () => {
  const { wallet } = useWallet();

  let provider: ethers.providers.Web3Provider | null = null;
  if (wallet.provider) {
    provider = new ethers.providers.Web3Provider(wallet?.provider);
  }

  const [tokenBalances, setTokenBalances] = useState([]);

  const fetchTokenBalances = async () => {
    if (!provider || !wallet?.account) {
      return;
    }

    const tokens = [...tokenBalances];

    for (let i = 0; i < TOKENS.length; i++) {
      const contract = new ethers.Contract(TOKENS[i].address, ERC20_ABI).connect(provider);
      
      let balance = new BigNumber(0);
      if (TOKENS[i].address === VETH) {
        const ethBalance = await provider.getBalance(wallet.account);
        balance = new BigNumber(ethBalance.toString())
      } else {
        balance = await contract.balanceOf(wallet.account);
      }

      const findIndex = tokens.findIndex((token) => token.address === TOKENS[i].address);
      if (findIndex >= 0) {
        tokens[findIndex].balance = balance
      } else {
        tokens.push({
          ...TOKENS[i],
          balance
        })
      }
    }

    setTokenBalances(tokens);
  }

  useEffect(() => {
    fetchTokenBalances();
  }, [wallet])

  return {
    tokenBalances,
    fetchTokenBalances
  }
}

export default useBalance
