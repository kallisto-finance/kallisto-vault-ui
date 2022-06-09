import { useEffect, useState } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import curve from "@curvefi/api";

import { addresses } from "utils/constants";
import { useWallet } from "./useWallet";

import { compare } from "utils/number";
import { VETH, MAX_AMOUNT, GAS_MULTIPLIER, SLIPPAGE } from "utils/constants";

import VAULT_ABI from "../abis/kallisto_apy_vault.json";
import ERC20_ABI from "../abis/erc20.json";

const apy_vault_pool = addresses.contracts.apy_vault;

const usePool = () => {
  const { wallet } = useWallet();

  let provider: ethers.providers.Web3Provider | null = null;
  if (wallet.provider) {
    provider = new ethers.providers.Web3Provider(wallet?.provider);
  } else {
    provider = new ethers.providers.Web3Provider((window as any).ethereum);
  }

  const [vaultInfo, setVaultInfo] = useState({
    tvl: new BigNumber(0),
    totalSupply: new BigNumber(0),
    apy: 0,

    mainPoolAddress: "",
    mainPoolInfo: null,
    mainCurvePool: null,

    mainLPAddress: "",
    mainLPTokenPrice: new BigNumber(0),
    mainLPDecimals: 18,

    userBalance: new BigNumber(0),
    userLiquidity: new BigNumber(0),
    sharedPercentage: "0",

    underlyingCoins: [],
    coins: [],
  });

  const fetchVaultInfo = async () => {
    if (!provider || !wallet?.account) {
      return;
    }

    // await curve.init('JsonRpc', {}, {gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0});
    await curve.init(
      "Web3",
      { externalProvider: wallet.provider },
      { chainId: Number(wallet.network) }
    );

    const signer = provider.getSigner(wallet.account);
    const contract = new ethers.Contract(apy_vault_pool, VAULT_ABI, signer);

    const mainPoolAddress = await contract.main_pool();
    const mainLPAddress = await contract.main_lp_token();

    const totalSupply = await contract.totalSupply();
    const userBalance = wallet?.account
      ? await contract.balanceOf(wallet.account)
      : 0;

    const sharedPercentage =
      compare(totalSupply, 0) === 0
        ? "0"
        : new BigNumber(userBalance.toString())
            .dividedBy(totalSupply.toString())
            .multipliedBy(100)
            .toFixed(2);

    // Get Pool Info
    let mainLPTokenPrice = new BigNumber(0);
    let tvl = new BigNumber(0);
    let decimals = 0;
    let apy = 0;

    const findIndex = addresses.contracts.curve_pools.findIndex(
      (pool) => pool.address.toLowerCase() === mainPoolAddress.toLowerCase()
    );

    let underlyingCoins = [];
    let coins = [];
    let mainPool = null;

    if (findIndex >= 0) {
      mainPool = new curve.Pool(
        addresses.contracts.curve_pools[findIndex].name
      );
      const stats = await mainPool.stats.getParameters();

      const apys = await mainPool.stats.getBaseApy();
      apy = Number(apys.day);

      mainLPTokenPrice = new BigNumber(stats.virtualPrice);

      const mainLPTokenContract = new ethers.Contract(
        mainLPAddress,
        ERC20_ABI
      ).connect(provider);

      decimals = await mainLPTokenContract.decimals();
      const vaultLPBalance = await mainLPTokenContract.balanceOf(
        apy_vault_pool
      );

      // console.log('lb', vaultLPBalance, vaultLPBalance.toString(), mainLPTokenPrice.toString(), decimals);

      tvl = new BigNumber(vaultLPBalance.toString()).multipliedBy(
        mainLPTokenPrice
      );

      // console.log('ddddd', tvl.toString());

      underlyingCoins = [...mainPool.underlyingCoins];
      coins = [...mainPool.coins];
    }

    setVaultInfo({
      tvl,
      totalSupply,
      apy,

      mainPoolAddress,
      mainPoolInfo:
        findIndex >= 0 ? addresses.contracts.curve_pools[findIndex] : null,
      mainCurvePool: mainPool,

      mainLPAddress,
      mainLPTokenPrice,
      mainLPDecimals: decimals,

      userBalance,
      userLiquidity: tvl.multipliedBy(sharedPercentage).dividedBy(100),
      sharedPercentage,

      underlyingCoins,
      coins,
    });
  };

  useEffect(() => {
    fetchVaultInfo();
  }, [wallet]);

  const addLiquidity = async (
    depositToken,
    depositAmount,
    onSuccess = (res) => {},
    onError = (e) => {}
  ) => {
    let errorFlag = false;

    console.log(vaultInfo);

    // Token symbol which is using for adding liquidity
    // mainToken should be one of underlying tokens
    // If mainToken is not included in underlying tokens, mainToken should be swapped to one of the underlying token
    // And mainToken will be the swapped token symbol
    let mainToken = depositToken.symbol;

    const shouldSwap = vaultInfo.underlyingCoins.includes(mainToken)
      ? false
      : true;
    console.log("should swap", shouldSwap);

    let swapRoute = [];
    try {
      // if (shouldSwap) {
      //   const baseToken =
      //     depositToken.address == VETH ? "WETH" : depositToken.symbol;
      //   const swapAmount = depositAmount.value
      //     .dividedBy(10 ** depositToken.decimals)
      //     .toString();
      //   console.log(baseToken, swapAmount);
      //   const { route, output } = await curve.getBestRouteAndOutput(
      //     baseToken,
      //     vaultInfo.underlyingCoins[2],
      //     swapAmount
      //   );

      //   console.log("swap result ************************");
      //   console.log(route, output);
      // }
    } catch (e) {
      errorFlag = true;
      onError(e);
    }

    if (errorFlag) {
      return;
    }

    const signer = provider.getSigner();
    // const signer = provider.getSigner(wallet.account);

    // Check Allowance
    let approveHash: string | undefined;
    if (depositToken.address !== VETH) {
      const depositTokenContract = new ethers.Contract(
        depositToken.address,
        ERC20_ABI,
        signer
      );
      const allowance = await depositTokenContract.allowance(
        wallet.account,
        apy_vault_pool
      );

      console.log("allowance", allowance.toString());
      if (compare(allowance, 0) <= 0) {
        let approvalEstimationGas =
          await depositTokenContract.estimateGas.approve(
            apy_vault_pool,
            MAX_AMOUNT
          );
        approvalEstimationGas = approvalEstimationGas.add(
          approvalEstimationGas.div(GAS_MULTIPLIER)
        );

        console.log("approve estimate gas", approvalEstimationGas.toString());

        // Approve
        try {
          const { hash } = await depositTokenContract.approve(
            apy_vault_pool,
            MAX_AMOUNT,
            { gasLimit: approvalEstimationGas }
          );
          approveHash = hash;

          if (approveHash) {
            await provider.waitForTransaction(approveHash);
          }
        } catch (e) {
          errorFlag = true;
          onError(e);
        }
      }
    }

    /**
     * ---------------------------------------------
     * Calculate quote amount
     * ---------------------------------------------
     */
    console.log(vaultInfo.mainCurvePool);
    const mainUnderlyingTokenIndex = vaultInfo.underlyingCoins.findIndex(
      (coin) => coin === mainToken
    );

    console.log(vaultInfo.underlyingCoins, mainToken, mainUnderlyingTokenIndex);
    const addingLiquidityTokenAmounts = vaultInfo.underlyingCoins.map((coin) =>
      coin === mainToken ? depositAmount.value.toString() : "0"
    );
    console.log("adding liquidity amount", addingLiquidityTokenAmounts);

    const expectedLpTokenAmount =
      await vaultInfo.mainCurvePool.addLiquidityExpected(
        addingLiquidityTokenAmounts
      );
    console.log("expected lp amount", expectedLpTokenAmount);

    /**
     * ---------------------------------------------
     * Calculate expected balance including slippage start
     * ---------------------------------------------
     */
    const mainLPTokenContract = new ethers.Contract(
      vaultInfo.mainLPAddress,
      ERC20_ABI,
      signer
    );

    // lp balance of vault
    const vaultLPBalance = await mainLPTokenContract.balanceOf(apy_vault_pool);
    console.log("vault lp balance", vaultLPBalance.toString());

    // total supply
    const vaultContract = new ethers.Contract(
      apy_vault_pool,
      VAULT_ABI,
      signer
    );
    const totalSupply = await vaultContract.totalSupply();
    console.log("vault total supply", totalSupply.toString());

    // calculate expected balance
    // expected balance = [expected lp balance] * [vault lp balance] / [total supply] * [slippage]
    const expectedBalance = new BigNumber(expectedLpTokenAmount.toString())
      .multipliedBy(new BigNumber(vaultLPBalance.toString()))
      .dividedBy(new BigNumber(totalSupply.toString()))
      .multipliedBy(SLIPPAGE)
      .decimalPlaces(0);
    console.log("expectedBalance", expectedBalance.toString());

    /**
     * ---------------------------------------------
     * Add Liquidity
     * ---------------------------------------------
     */
    console.log("minting params -------------");
    console.log(
      depositToken.address,
      depositAmount.value.toString(),
      mainUnderlyingTokenIndex.toString(),
      expectedBalance.toString()
    );

    let depositEstimationGas;
    try {
      depositEstimationGas = await vaultContract.estimateGas.deposit(
        depositToken.address,
        ethers.BigNumber.from(depositAmount.value.toString()),
        mainUnderlyingTokenIndex,
        swapRoute,
        ethers.BigNumber.from(expectedBalance.toString()),
        {
          value:
            depositToken.address === VETH
              ? ethers.BigNumber.from(depositAmount.value.toString())
              : ethers.BigNumber.from(0),
          from: wallet.account,
        }
      );

      depositEstimationGas = depositEstimationGas.add(
        depositEstimationGas.div(GAS_MULTIPLIER)
      );

      console.log("deposit estimate gas", depositEstimationGas.toString());
    } catch (e) {
      errorFlag = true;
    }

    let depositHash: string | undefined;
    // Deposit
    try {
      const { hash } = await vaultContract.deposit(
        depositToken.address,
        ethers.BigNumber.from(depositAmount.value.toString()),
        mainUnderlyingTokenIndex,
        swapRoute,
        ethers.BigNumber.from(expectedBalance.toString()),
        {
          value:
            depositToken.address === VETH
              ? ethers.BigNumber.from(depositAmount.toString())
              : ethers.BigNumber.from(0),
          from: wallet.account,
          gasLimit: depositEstimationGas,
        }
      );
      depositHash = hash;
      console.log("deposit hash", depositHash);
      if (depositHash) {
        await provider.waitForTransaction(depositHash);
      }
    } catch (e) {
      errorFlag = true;
      onError(e);
    }

    if (!errorFlag) {
      onSuccess({
        token: depositToken,
        amount: depositAmount.value,
        txHash: depositHash,
      });
    }
  };

  return {
    vaultInfo,
    fetchVaultInfo,
    addLiquidity,
  };
};

export default usePool;
