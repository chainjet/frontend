import Head from 'next/head'
import * as React from 'react'
require('./CookieConsent.less')

declare global {
  interface Window {
    cookieconsent: any
  }
}

class CookieConsent extends React.PureComponent<{}> {
  componentDidMount() {
    if (typeof window === 'undefined') {
      return
    }

    require('cookieconsent')
    window.cookieconsent.initialise({
      position: 'bottom-right',
      palette: {
        popup: {
          background: '#dfeaff',
          text: '#5c7291',
          padding: 0,
        },
        button: {
          background: '#1890ff',
          text: '#ffffff',
        },
      },
      showLink: false,
      content: {
        message: `This website uses cookies for technical, analytical, and marketing purposes.
          <a href="/legal/privacy">Learn more</a>.`,
        dismiss: 'Close',
      },
    })
  }

  render() {
    return (
      <Head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/cookieconsent/3.1.1/cookieconsent.min.css"
        />
      </Head>
    )
  }
}

export default CookieConsent
