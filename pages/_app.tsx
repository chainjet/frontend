import App from 'next/app'
import Head from 'next/head'
import { configureChains, createClient, defaultChains, WagmiConfig } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
import CookieConsent from '../components/common/CookieConsent'
import GoogleAnalytics from '../components/common/GoogleAnalytics'
import { TidioChat } from '../components/common/TidioChat'
import '../styles/globals.css'

const { chains, provider } = configureChains(defaultChains, [publicProvider()])

const client = createClient({
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

export default class ChainJetApp extends App {
  render() {
    const { Component, pageProps } = this.props

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

        <WagmiConfig client={client}>
          <Component {...pageProps} />
        </WagmiConfig>
      </>
    )
  }
}
