import App from 'next/app'
import Head from 'next/head'
import CookieConsent from '../components/common/CookieConsent'
import { TidioChat } from '../components/common/TidioChat'
import GoogleAnalytics from '../components/common/GoogleAnalytics'
import '../styles/globals.css'

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

        <Component {...pageProps} />
      </>
    )
  }
}
