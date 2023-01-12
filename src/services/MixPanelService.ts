import mixpanel from 'mixpanel-browser'

export const MixPanelService = {
  _initialized: false,

  _initialize() {
    mixpanel.init('273d0bfe4550fe14e6e62ec73ca2f6ea', { debug: true })
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
}
