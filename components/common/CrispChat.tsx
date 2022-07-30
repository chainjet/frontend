import React from 'react'

declare global {
  interface Window {
    $crisp: []
    CRISP_WEBSITE_ID: string | undefined
  }
}

export class CrispChat extends React.PureComponent<{}> {
  componentDidMount () {
    window.$crisp = []
    window.CRISP_WEBSITE_ID = process.env.CRISP_WEBSITE_ID

    ;(function() {
      const s = document.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = true
      document.getElementsByTagName('head')[0].appendChild(s)
    })()
  }

  render () {
    return <></>
  }
}
