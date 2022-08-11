import ReactGA from 'react-ga4'

type UaEventOptions = {
  action: string
  category: string
  label?: string
  value?: number
  nonInteraction?: boolean
  transport?: 'beacon' | 'xhr' | 'image'
}

export const GoogleAnalyticsService = {
  _initialized: false,

  _initialize() {
    ReactGA.initialize([{ trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_CODE || 'G-0000000000' }], {
      testMode: !process.env.NEXT_PUBLIC_GA_TRACKING_CODE,
    })
    this._initialized = true
  },

  trackPage(page: string) {
    if (!this._initialized) {
      this._initialize()
    }

    // set timeout needed to give time to refresh the page title
    setTimeout(() => {
      ReactGA.set({ page })
      ReactGA.send({ hitType: 'pageview', page })
    }, 0)
  },

  sendEvent(event: UaEventOptions) {
    if (!this._initialized) {
      this._initialize()
    }

    ReactGA.event(event)
  },
}
