import { useEffect, useState } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import curve from "@curvefi/api";

import { addresses } from "utils/constants";
import { useWallet } from "./useWallet";

import { compare } from "utils/number";

import VAULT_ABI from "../abis/kallisto_apy_vault.json";
import ERC20_ABI from "../abis/erc20.json";

const apy_vault_pool = addresses.contracts.apy_vault;
 
const usePool = () => {
  const { wallet } = useWallet();

  let provider: ethers.providers.Web3Provider | null = null;
  if (wallet.provider) {
    provider = new ethers.providers.Web3Provider(wallet?.provider);
  }

  const [vaultInfo, setVaultInfo] = useState({
    tvl: new BigNumber(0),
    totalSupply: new BigNumber(0),
    apy: 0,

    mainPoolAddress: "",
    mainPoolInfo: null,
    
    mainLPAddress: "",
    mainLPTokenPrice: new BigNumber(0),
    mainLPDecimals: 18,
    
    userBalance: new BigNumber(0),
    userLiquidity: new BigNumber(0),
    sharedPercentage: "0"
  });

  const fetchVaultInfo = async () => {
    if (!provider) {
      return;
    }

    // await curve.init('JsonRpc', {}, {gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0});
    await curve.init("Web3", { externalProvider: wallet.provider }, { chainId: Number(wallet.network) })

    // const signer = provider.getSigner();
    const contract = new ethers.Contract(apy_vault_pool, VAULT_ABI).connect(provider);

    const mainPoolAddress = await contract.main_pool();
    const mainLPAddress = await contract.main_lp_token();

    const totalSupply = await contract.totalSupply();
    const userBalance = wallet?.account ? await contract.balanceOf(wallet.account) : 0;

    const sharedPercentage = compare(totalSupply, 0) === 0 ? "0" : new BigNumber(userBalance.toString()).dividedBy(totalSupply.toString()).multipliedBy(100).toFixed(2);

    // Get Pool Info
    let mainLPTokenPrice = new BigNumber(0);
    let tvl = new BigNumber(0);
    let decimals = 0;
    let apy = 0;

    const findIndex = addresses.contracts.curve_pools.findIndex((pool) => pool.address.toLowerCase() === mainPoolAddress.toLowerCase());

    if (findIndex >= 0) {
      const mainPool = new curve.Pool(addresses.contracts.curve_pools[findIndex].name);
      const stats = await mainPool.stats.getParameters();
      
      const apys = await mainPool.stats.getBaseApy();
      apy = Number(apys.day);

      mainLPTokenPrice = new BigNumber(stats.virtualPrice);

      const mainLPTokenContract = new ethers.Contract(mainLPAddress, ERC20_ABI).connect(provider);

      decimals = await mainLPTokenContract.decimals();
      const vaultLPBalance = await mainLPTokenContract.balanceOf(apy_vault_pool);

      // console.log('lb', vaultLPBalance, vaultLPBalance.toString(), mainLPTokenPrice.toString(), decimals);

      tvl = new BigNumber(vaultLPBalance.toString()).multipliedBy(mainLPTokenPrice);

      // console.log('ddddd', tvl.toString());


      console.log(mainPool.underlyingCoins); // [ 'DAI', 'USDC', 'USDT' ]
      console.log(mainPool.coins); // [ 'aDAI', 'aUSDC', 'aUSDT' ]
    }

    setVaultInfo({
      tvl,
      totalSupply,
      apy,

      mainPoolAddress,
      mainPoolInfo: findIndex >= 0 ? addresses.contracts.curve_pools[findIndex] : null,
      
      mainLPAddress,
      mainLPTokenPrice,
      mainLPDecimals: decimals,
      
      userBalance,
      userLiquidity: tvl.multipliedBy(sharedPercentage).dividedBy(100),
      sharedPercentage,
    })
  };

  useEffect(() => {
    fetchVaultInfo();
  }, [wallet])

  return {
    vaultInfo,
    fetchVaultInfo,
  }
};

export default usePool;
