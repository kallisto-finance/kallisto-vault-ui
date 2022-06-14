import { useEffect, useState } from "react";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import curve from "@curvefi/api";

import { addresses, WETH } from "utils/constants";
import { useWallet } from "./useWallet";

import { compare } from "utils/number";
import {
  VETH,
  MAX_AMOUNT,
  GAS_MULTIPLIER,
  SLIPPAGE,
  SLIPPAGE_DOMINATOR,
} from "utils/constants";

import VAULT_ABI from "../abis/kallisto_apy_vault.json";
import VAULT_ABI2 from "../abis/kallisto_apy_vault_readable.json";
import ERC20_ABI from "../abis/erc20.json";

const apy_vault_pool = addresses.contracts.apy_vault;

const usePool = () => {
  const { wallet } = useWallet(); 

  let provider: any;
  if (wallet.provider) {
    provider = new ethers.providers.Web3Provider(wallet?.provider);
  } else {
    provider = new ethers.providers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    );
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
    underlyingCoinAddresses: [],
    coins: [],
  });

  const fetchVaultInfo = async () => {
    if (!provider) {
      return;
    }

    // await curve.init('JsonRpc', {}, {gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0});
    // await curve.init(
    //   "Web3",
    //   { externalProvider: provider },
    //   { chainId: 1 }
    // );
    await curve.init(
      "Infura",
      { network: "homestead", apiKey: process.env.INFURA_PROJECT_ID },
      { gasPrice: 0, maxFeePerGas: 0, maxPriorityFeePerGas: 0, chainId: 1 }
    );

    // const signer = provider.getSigner(wallet.account);
    const contract = new ethers.Contract(apy_vault_pool, VAULT_ABI, provider);

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
    let underlyingCoinAddresses = [];
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
      underlyingCoinAddresses = [...mainPool.underlyingCoinAddresses];
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
      underlyingCoinAddresses,
      coins,
    });
  };

  useEffect(() => {
    fetchVaultInfo();
  }, [wallet]);

  /***
   * Add Liquidity
   */
  const addLiquidity = async (
    depositToken,
    depositAmount,
    onSuccess = (res) => {},
    onError = (e) => {}
  ) => {
    const signer = provider.getSigner();
    // const signer = provider.getSigner(wallet.account);

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
    let expectedSwapAmount = new BigNumber(0);
    let swapOutputTokenSymbol = "";
    let swapOutputTokenDecimals = "";

    try {
      if (shouldSwap) {
        const baseToken =
          depositToken.address == VETH ? "WETH" : depositToken.symbol;
        const swapAmount = depositAmount.value
          .dividedBy(10 ** depositToken.decimals)
          .toString();
        console.log(baseToken, swapAmount);

        let { route, output } = await curve.getBestRouteAndOutput(
          baseToken,
          vaultInfo.underlyingCoins[0],
          swapAmount
        );

        console.log("swap result ************************");
        console.log(route, output);

        if (route.length === 0) {
          onError({
            message: "Can not swap",
          });
          return;
        }
        if (depositToken.address === VETH) {
          if (route[0].poolId === "tricrypto2") {
            swapRoute.push([VETH, WETH, 0, 1, false, false]);
          }
        } else if (depositToken.address === WETH) {
          swapRoute.push([WETH, VETH, 1, 0, false, false]);
        }

        for (let i = 0; i < route.length; i++) {
          if (route[i].poolAddress === vaultInfo.mainPoolAddress) {
            break;
          }

          const isUnderlying =
            route[i].swapType === 2 || route[i].swapType === 4 ? true : false;
          const isCryptoPool =
            route[i].swapType === 3 || route[i].swapType === 4 ? true : false;

          swapRoute.push([
            route[i].poolAddress,
            route[i].outputCoinAddress,
            route[i].i,
            route[i].j,
            isUnderlying,
            isCryptoPool,
          ]);
        }

        console.log("swapRoute param", swapRoute);

        const lastToken = swapRoute[swapRoute.length - 1][1];
        const lastTokenContract = new ethers.Contract(
          lastToken,
          ERC20_ABI,
          signer
        );

        swapOutputTokenSymbol = await lastTokenContract.symbol();
        swapOutputTokenDecimals = await lastTokenContract.decimals();

        console.log(
          "last token info",
          swapOutputTokenSymbol,
          swapOutputTokenDecimals
        );

        if (swapOutputTokenSymbol !== vaultInfo.underlyingCoins[0]) {
          output = await curve.routerExchangeExpected(
            baseToken,
            swapOutputTokenSymbol,
            swapAmount
          );
        }

        console.log("Final swap params -------------------------------------");
        console.log(swapRoute.toString());
        console.log(swapRoute);
        console.log(swapOutputTokenSymbol, swapOutputTokenDecimals, output);

        expectedSwapAmount = new BigNumber(output);

        console.log("-------------------------------------------------------");
      }
    } catch (e) {
      errorFlag = true;
      onError(e);
    }

    if (errorFlag) {
      return;
    }

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
    if (shouldSwap) {
      mainToken = swapOutputTokenSymbol;
    }

    console.log("mainToken", mainToken);

    const mainUnderlyingTokenIndex = vaultInfo.underlyingCoins.findIndex(
      (coin) => coin === mainToken
    );

    console.log(vaultInfo.underlyingCoins, mainToken, mainUnderlyingTokenIndex);

    const amount = shouldSwap
      ? expectedSwapAmount.toString()
      : new BigNumber(depositAmount.value.toString())
          .dividedBy(new BigNumber(10 ** depositToken.decimals))
          .toString();
    const addingLiquidityTokenAmounts = vaultInfo.underlyingCoins.map((coin) =>
      coin === mainToken ? amount : "0"
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
    const expectedBalanceTemp = totalSupply.isZero()
      ? new BigNumber(0)
      : new BigNumber(expectedLpTokenAmount.toString())
          .multipliedBy(new BigNumber(vaultLPBalance.toString()))
          .multipliedBy(SLIPPAGE)
          .dividedBy(new BigNumber(totalSupply.toString()))
          .dividedBy(SLIPPAGE_DOMINATOR)
          .decimalPlaces(0);
    console.log(
      "expectedBalanceTemp",
      expectedBalanceTemp,
      expectedBalanceTemp.toString()
    );
    const expectedBalance = ethers.utils.parseUnits(
      expectedBalanceTemp.toString(),
      vaultInfo.mainLPDecimals
    );
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
        expectedBalance.toString(),
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
        expectedBalance.toString(),
        {
          value:
            depositToken.address === VETH
              ? ethers.BigNumber.from(depositAmount.value.toString())
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

  const withdrawLiquidity = async (
    withdrawToken,
    withdrawPercentage,
    onSuccess = (res) => {},
    onError = (e) => {}
  ) => {
    try {
      console.log(vaultInfo);
      const signer = provider.getSigner();

      let mainToken = withdrawToken.symbol;

      const shouldSwap = vaultInfo.underlyingCoins.includes(mainToken)
        ? false
        : true;
      console.log("should swap", shouldSwap);

      let swapRoute = [];
      if (shouldSwap) {
        let { route } = await curve.getBestRouteAndOutput(
          vaultInfo.underlyingCoins[0],
          mainToken,
          "100"
        );

        console.log("swap route", route);

        for (let i = 0; i < route.length; i++) {
          if (route[i].poolAddress === vaultInfo.mainPoolAddress) {
            continue;
          }

          const isUnderlying =
            route[i].swapType === 2 || route[i].swapType === 4 ? true : false;
          const isCryptoPool =
            route[i].swapType === 3 || route[i].swapType === 4 ? true : false;

          let outputCoinAddress = route[i].outputCoinAddress;
          if (
            route[i].poolId === "tricrypto2" &&
            route[i].outputCoinAddress.toLocaleLowerCase() ===
              VETH.toLowerCase()
          ) {
            outputCoinAddress = WETH;
          }

          swapRoute.push([
            route[i].poolAddress,
            outputCoinAddress,
            route[i].i,
            route[i].j,
            isUnderlying,
            isCryptoPool,
          ]);
        }

        if (withdrawToken.address === VETH) {
          if (route[route.length - 1].poolId === "tricrypto2") {
            swapRoute.push([WETH, VETH, 1, 0, false, false]);
          }
        } else if (withdrawToken.address === WETH) {
          swapRoute.push([VETH, WETH, 0, 1, false, false]);
        }

        if (route[0].poolAddress !== vaultInfo.mainPoolAddress) {
          mainToken = vaultInfo.underlyingCoins[0];
        } else {
          const mainTokenAddress = route[0].outputCoinAddress;
          const lastTokenContract = new ethers.Contract(
            mainTokenAddress,
            ERC20_ABI,
            signer
          );
          mainToken = await lastTokenContract.symbol();
        }

        console.log("swap route", swapRoute);
      }

      const mainUnderlyingTokenIndex = vaultInfo.underlyingCoins.findIndex(
        (coin) => coin === mainToken
      );
      console.log(
        vaultInfo.underlyingCoins,
        mainToken,
        mainUnderlyingTokenIndex
      );

      /**
       * --------------------------------------------------------------------------
       * Calculate how much lp should be removed
       * --------------------------------------------------------------------------
       */
      const tempContract = new ethers.Contract(
        apy_vault_pool,
        VAULT_ABI2,
        signer
      );
      const userBalance = await tempContract.balanceOf(wallet?.account);
      const removeBalance = userBalance.mul(withdrawPercentage).div(100);
      console.log(
        "userBalance",
        userBalance,
        userBalance.toString(),
        removeBalance.toString()
      );

      const expectedAmount = await tempContract.withdraw(
        vaultInfo.underlyingCoinAddresses[mainUnderlyingTokenIndex],
        removeBalance.toString(),
        mainUnderlyingTokenIndex,
        swapRoute,
        0
      );
      console.log("expectedAmount", expectedAmount, expectedAmount.toString());
      const minAmount = expectedAmount.mul(995).div(1000);

      const vaultContract = new ethers.Contract(
        apy_vault_pool,
        VAULT_ABI,
        signer
      );

      console.log("withdraw params ************************");
      console.log(
        vaultInfo.underlyingCoinAddresses[mainUnderlyingTokenIndex],
        removeBalance.toString(),
        mainUnderlyingTokenIndex,
        swapRoute,
        minAmount.toString()
      );

      let withdrawEstimationGas = await vaultContract.estimateGas.withdraw(
        vaultInfo.underlyingCoinAddresses[mainUnderlyingTokenIndex],
        removeBalance.toString(),
        mainUnderlyingTokenIndex,
        swapRoute,
        minAmount.toString(),
        {
          from: wallet.account,
        }
      );

      withdrawEstimationGas = withdrawEstimationGas.add(
        withdrawEstimationGas.div(GAS_MULTIPLIER)
      );

      console.log("withdraw estimate gas", withdrawEstimationGas.toString());

      let withdrawHash: string | undefined;
      const { hash } = await vaultContract.withdraw(
        vaultInfo.underlyingCoinAddresses[mainUnderlyingTokenIndex],
        removeBalance.toString(),
        mainUnderlyingTokenIndex,
        swapRoute,
        minAmount.toString(),
        {
          from: wallet.account,
          gasLimit: withdrawEstimationGas,
        }
      );
      withdrawHash = hash;
      console.log("withdraw hash", withdrawHash);
      if (withdrawHash) {
        await provider.waitForTransaction(withdrawHash);
      }

      onSuccess({
        token: withdrawToken,
        amount: expectedAmount,
        txHash: withdrawHash,
      });
    } catch (e) {
      onError(e);
    }
  };

  return {
    vaultInfo,
    fetchVaultInfo,
    addLiquidity,
    withdrawLiquidity,
  };
};

export default usePool;
