import mixpanel from 'mixpanel-browser'
import { UaEventOptions } from 'react-ga4/types/ga4'
import { capitalize } from '../utils/strings'

export const MixPanelService = {
  _initialized: false,

  _initialize() {
    mixpanel.init('273d0bfe4550fe14e6e62ec73ca2f6ea')
    this._initialized = true
  },

  trackPage(url: string) {
    if (!this._initialized) {
      this._initialize()
    }

    mixpanel.track('Page View', {
      url,
    })
  },

  sendEvent(event: UaEventOptions) {
    mixpanel.track(capitalize(event.action).replace(/_/g, ' '), {
      category: event.category,
      label: event.label,
    })
  },
}
