export type TMap = {
  [key: string]: any;
};

export type EthNetwork = 'mainnet' | 'rinkeby' | 'goerli' | 'ropsten' | 'kovan';
export type NetworkIds = '1' | '4' | '5' | '3' | '42';
export type Provider = 'metamask' | 'walletconnect';
export interface Wallet {
    account: string | null;
    providerName: Provider | null;
    provider: any | null;
    network: NetworkIds | null;
}








export type LIQUIDITY_BUTTON_STATUS =
  | "success"
  | "enter_amount"
  | "insufficient"
  | "loading";

export type LIQUIDITY_BUTTON_TEXT =
  | "Deposit UST"
  | "Enter an amount"
  | "Insufficient Balance"
  | "Confirm Withdraw"
  | "Insufficient Liquidity"
  | "Withdrawing UST";

export interface LIQUIDITY_BALANCE_STATUS {
  text: LIQUIDITY_BUTTON_TEXT;
  status: LIQUIDITY_BUTTON_STATUS;
}

export type COLLECT_TYPE = "UST" | "bLUNA";

export type TRANSACTION_STATUS =
  | "Success"
  | "User Denied"
  | "Create Tx Failed"
  | "Tx Failed"
  | "Timeout"
  | "Unspecified Error"
  | "Unknown Error";

