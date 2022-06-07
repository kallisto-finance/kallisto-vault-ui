import { NetworkIds, Provider, Wallet } from "types";
import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import Cookies from "universal-cookie";
import WalletConnectProvider from "@walletconnect/web3-provider";
import curve from "@curvefi/api";

import { ModalContainer, ModalSelectWallet } from "components/Modal";

const cookies = new Cookies();

const wcProvider = new WalletConnectProvider({
  infuraId: process.env.INFURA_PROJECT_ID,
  qrcodeModalOptions: {
    mobileLinks: ["trust", "argent", "ledger"],
  },
});

type WalletContextType = {
  ethereum?: any;
  wallet: Wallet;
  connectMetaMask: () => Promise<void>;
  connectWalletConnect: () => Promise<void>;
  disconnectWallet: () => void;
  openConnectionModal: () => void;
  error: Error | null;
  availableProviders: { [providerName in Provider]: boolean };
};

const initialWallet = {
  ethereum: null,
  wallet: {
    account: null,
    provider: null,
    providerName: null,
    network: null,
  },
  error: null,
};
export const WalletContext =
  createContext<Partial<WalletContextType>>(initialWallet);

export const WalletProvider = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  const ethereum = (window as any).ethereum;
  const availableProviders = {
    metamask: ethereum?.isMetaMask,
    walletconnect: true,
  };
  // Try to read wallet from cookies
  const initialWalletState: Wallet = {
    account: null,
    provider: null,
    providerName: null,
    network: null,
  };
  const [wallet, setWallet] = useState<Wallet>(initialWalletState);

  useEffect(() => {
    const walletFromCookie: Partial<Wallet> = cookies.get("current_wallet");
    if (
      walletFromCookie &&
      walletFromCookie.account &&
      walletFromCookie.providerName
    ) {
      // only recover metamask from cookie to avoid edge cases / sync issues with walletconnect bridge
      if (walletFromCookie.providerName === "metamask") {
        const provider = (window as any).ethereum;
        const network = ethereum.networkVersion || "1";
        setWallet({ ...walletFromCookie, network, provider } as Wallet);
      }
    }
  }, [ethereum?.networkVersion]);

  const [error, setError] = useState<Error | null>(null);

  const disconnectWallet = useCallback(() => {
    setWallet({
      account: null,
      providerName: null,
      provider: null,
      network: null,
    });
    cookies.remove("current_wallet");
  }, [wallet.account, wallet.providerName]);

  // Subscribe to updates (do this before calling connection in case we load from cookies)
  useEffect(() => {
    if (ethereum) {
      const handleNetworkChange = (networkId: NetworkIds) => {
        if (wallet?.providerName !== "metamask") return;

        setWallet({ ...wallet, network: networkId });
      };

      const handleAccountChange = (accounts: string[]) => {
        // If we are not currently connected with metamask, then no-op
        if (wallet.providerName !== "metamask") return;

        const [account] = accounts;
        if (account) {
          const walletObj: Wallet = {
            account,
            providerName: "metamask",
            provider: (window as any).ethereum,
            network: ethereum.networkVersion || "1",
          };

          setWallet(walletObj);
        } else {
          disconnectWallet();
        }
      };
      ethereum.on("accountsChanged", handleAccountChange);

      ethereum.on("networkChanged", handleNetworkChange);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountChange);
        ethereum.removeListener("networkChanged", handleNetworkChange);
      };
    }
  }, [disconnectWallet, ethereum, wallet]);

  useEffect(() => {
    // const handleConnect = (...params: any[]) => {
    //     console.log('wallet connect : onConnect', params);
    // };

    // wcProvider.on('connect', handleConnect);

    // const handleSessionUpdate = (error: any, payload: any) => {
    //     console.log('wallet connect : onSessionUpdate', payload);
    // };
    // wcProvider.on('session_update', handleSessionUpdate);

    const handleAccountChange = (accounts: string[]) => {
      const [account] = accounts;

      if (account) {
        const walletObj: Wallet = {
          account,
          providerName: "walletconnect",
          provider: wcProvider,
          network: (wcProvider?.networkId as unknown as NetworkIds) || "1",
        };

        setWallet(walletObj);
      }
    };

    // TODO this doesn't work with wallet connect
    const handleNetworkChange = (newNetwork: string, oldNetwork?: string) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
        window.location.reload();
        setWallet({
          account: null,
          provider: null,
          providerName: null,
          network: null,
        });
      }
    };

    const handleDisconnect = () => {
      setWallet({
        account: null,
        provider: null,
        providerName: null,
        network: null,
      });
      cookies.remove("current_wallet");
    };

    wcProvider.on("network", handleNetworkChange);
    wcProvider.on("accountsChanged", handleAccountChange);
    wcProvider.on("disconnect", handleDisconnect);

    return () => {
      wcProvider.removeListener("accountsChanged", handleAccountChange);
      wcProvider.removeListener("networkChanged", handleNetworkChange);
      wcProvider.removeListener("disconnect", handleDisconnect);
      // wcProvider.removeListener('connect', handleConnect);
      // wcProvider.removeListener('session_update', handleSessionUpdate);
    };
  }, []);

  const connectMetaMask = async () => {
    if (!ethereum) return;

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    const [account] = accounts;
    const walletObj: Wallet = {
      account,
      providerName: "metamask",
      provider: (window as any).ethereum,
      network: (window as any).ethereum.networkVersion || "1",
    };

    if (walletObj.provider) {
      await curve.init("Web3", { externalProvider: walletObj.provider }, { chainId: Number(walletObj.network) })
    }

    setWallet(walletObj);
  };

  const connectWalletConnect = async () => {
    await wcProvider.enable();
    const walletObj: Wallet = {
      account: wcProvider?.accounts[0],
      providerName: "walletconnect",
      provider: wcProvider,
      network: (wcProvider?.networkId as unknown as NetworkIds) || "1",
    };

    if (walletObj.provider) {
      await curve.init("Web3", { externalProvider: walletObj.provider }, { chainId: Number(walletObj.network) })
    }

    // If provider is different, set to the WC wallet
    // if (wallet.provider !== 'walletconnect') {
    setWallet(walletObj);
  };

  //re-set cookie when wallet state changes
  useEffect(() => {
    try {
      if (wallet && wallet?.account) {
        cookies.set(
          "current_wallet",
          {
            account: wallet.account,
            providerName: wallet.providerName,
          },
          {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          }
        );
      } else {
        // wallet was un-set, remove cookie
        cookies.remove("current_wallet");
      }
    } catch (e) {
      setError(e);
    }
  }, [wallet]);

  const [showChooseWalletModal, setShowChooseWalletModal] = useState(false);

  const handleConnectMetamask = async () => {
    try {
      await connectMetaMask();
      setShowChooseWalletModal(false);
    } catch (e) {}
  };

  const handleConnectWalletConnect = async () => {
    try {
      await connectWalletConnect();
      setShowChooseWalletModal(false);
    } catch (e) {}
  };

  const openConnectionModal = () => {
    setShowChooseWalletModal(true);
  }

  return (
    <WalletContext.Provider
      value={{
        ethereum,
        wallet,
        connectMetaMask,
        connectWalletConnect,
        disconnectWallet,
        openConnectionModal,
        availableProviders,
        error,
      }}
    >
      <>
        {children}
        {showChooseWalletModal && (
          <ModalContainer onClose={() => setShowChooseWalletModal(false)}>
            <ModalSelectWallet
              onChooseMetamask={() => handleConnectMetamask()}
              onChooseWalletConnect={() => handleConnectWalletConnect()}
            />
          </ModalContainer>
        )}
      </>
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  return useContext(WalletContext) as WalletContextType;
};
