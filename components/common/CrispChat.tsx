import React from 'react'

declare global {
  interface Window {
    $crisp: []
    CRISP_WEBSITE_ID: string | undefined
  }
}

export class CrispChat extends React.PureComponent<{}> {
  componentDidMount() {
    if (process.env.NEXT_PUBLIC_ENV) {
      window.$crisp = []
      window.CRISP_WEBSITE_ID = 'a924d2ec-09cc-4818-8bc0-792c809bfff0'
      ;(function () {
        const s = document.createElement('script')
        s.src = 'https://client.crisp.chat/l.js'
        s.async = true
        document.getElementsByTagName('head')[0].appendChild(s)
      })()
    }
  }

  render() {
    return <></>
  }
}
