import BigNumber from "bignumber.js";

const abbreviateNumberFactory = (symbols) => (
  number,
  minDigits,
  maxDigits,
  decimals = 18
) => {
  if (number === 0) return number;
  if (number < 1) return new BigNumber(number).dp(maxDigits, 1).toString();

  // determines SI symbol
  const tier = Math.floor(Math.log10(Math.abs(number)) / 3);

  // get suffix and determine scale
  const suffix = symbols[tier] === undefined ? `e${tier * 3}` : symbols[tier];
  const scale = 10 ** (tier * 3);

  // scale the number
  const scaled = number / scale;

  // format number and add suffix
  return (
    scaled.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }) + suffix
  );
};

const SI_SYMBOLS = ["", "k", "M", "G", "T", "P", "E"];

export const abbreviateNumberSI = abbreviateNumberFactory(SI_SYMBOLS);

export const toFixed = (number, decimals, string = false) => {
  const value = new BigNumber(new BigNumber(number).toFixed(decimals, 1));
  return string ? value : value.toNumber();
};

export const toShow = (num, decimals) => {
  return new BigNumber(num).isGreaterThan(10 ** 9)
    ? "∞"
    : toFixed(num, decimals, true).toString();
};

export const getOnlyDigitalValue = (val: number) => {
  return Math.floor(val);
};

export const getOnlyPointsValue = (val: number) => {
  return val - Math.floor(val);
};

export const numberWithCommas = (x) => {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
};

export const isNaN = (x) => {
  const bn = new BigNumber(x.toString());
  return bn.isNaN();
};

export const compare = (x, y) => {
  const bnX = new BigNumber(x.toString());
  const bnY = new BigNumber(y.toString());

  return bnX.comparedTo(bnY);
};

export const allowOnlyNumber = (value) => {
  if (value === "") {
    return true;
  }

  const re = /^[0-9\b]+$/;

  return re.test(value);
};

export const convertBalanceString = (value, fixed = 2) => {
  const balance = new BigNumber(value.toString()).toFormat(fixed);

  return balance;
};

export const formatBalance = (value, fixed = 2, decimals = 18) => {
  const balance = new BigNumber(value.toString())
    .div(10 ** decimals)
    .toFormat(fixed)
    .toString();

  return balance;
};

export const formatBalanceNumber = (value, fixed = 2, decimals = 18) => {
  const balance = formatBalance(value, fixed, decimals);

  return parseFloat(balance);
};

export const toBalance = (value, fixed = 3, decimals = 6) => {
  const balance = new BigNumber(value.toString())
    .div(10 ** decimals)
    .toFixed(fixed)
    .toString();

  return balance;
};

export const getBalanceFromTokenList = (tokenAddress, tokenList) => {
  const findIndex = tokenList.findIndex((item) => item.address.toLowerCase() === tokenAddress.toLowerCase());

  if (findIndex < 0) {
    return 0;
  }

  return tokenList[findIndex].balance;
}
