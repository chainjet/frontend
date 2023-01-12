import ReactGA from 'react-ga4'
import { UaEventOptions } from 'react-ga4/types/ga4'

const trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_CODE

export const GoogleAnalyticsService = {
  _initialized: false,

  _initialize() {
    ReactGA.initialize([{ trackingId: trackingId || 'G-0000000000' }], {
      testMode: !trackingId,
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

    if (trackingId) {
      ReactGA.event(event)
    } else {
      console.log(`[GA Event]`, event)
    }
  },
}
