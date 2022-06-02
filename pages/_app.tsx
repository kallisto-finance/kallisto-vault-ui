import { WalletProvider } from "hooks/useWallet";
import { QueryClient, QueryClientProvider } from "react-query";

import { AppProps } from "next/app";
import Layout from "layout";

import "../styles/index.scss";

const App = ({ Component, pageProps, router }: AppProps) => {
  const queryClient = new QueryClient();

  return typeof window !== "undefined" ? (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <Layout router={router} {...pageProps}>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </WalletProvider>
  ) : null;
};

export default App;
