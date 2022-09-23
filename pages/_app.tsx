import { ApolloProvider } from '@apollo/client'
import { NextComponentType, NextPageContext } from 'next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { FunctionComponent } from 'react'
import { configureChains, createClient, defaultChains, WagmiConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import CookieConsent from '../components/common/CookieConsent'
import GoogleAnalytics from '../components/common/GoogleAnalytics'
import PageLayout from '../components/common/PageLayout/PageLayout'
import { TidioChat } from '../components/common/TidioChat'
import { useApollo } from '../src/apollo-client'
import '../styles/globals.css'

const { chains, provider } = configureChains(defaultChains, [publicProvider()])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'ChainJet',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider,
})

export default function ChainJetApp({
  Component,
  pageProps,
}: AppProps & {
  Component: NextComponentType<NextPageContext> & {
    Guard: FunctionComponent
    Layout: FunctionComponent
    Provider: FunctionComponent
  }
}) {
  const apolloClient = useApollo(pageProps)

  return (
    <>
      <Head>
        <title />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:site_name" content="ChainJet" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@chainjetio" />
        <meta name="twitter:creator" content="@chainjetio" />

        {process.env.SLACK_APP_ID && <meta name="slack-app-id" content={process.env.SLACK_APP_ID}></meta>}
      </Head>

      <GoogleAnalytics />
      <CookieConsent />
      <TidioChat />

      <ApolloProvider client={apolloClient}>
        <WagmiConfig client={wagmiClient}>
          <PageLayout>
            <Component {...pageProps} />
          </PageLayout>
        </WagmiConfig>
      </ApolloProvider>
    </>
  )
}
