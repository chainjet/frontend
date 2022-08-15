import React from 'react'

export class TidioChat extends React.PureComponent<{}> {
  componentDidMount() {
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      ;(function () {
        const s = document.createElement('script')
        s.src = 'https://code.tidio.co/any4lrvf0c7wgqshf5wbc8kcqyllvvow.js'
        s.async = true
        document.getElementsByTagName('head')[0].appendChild(s)
      })()
    }
  }

  render() {
    return <></>
  }
}
