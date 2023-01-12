import { UaEventOptions } from 'react-ga4/types/ga4'
import { GoogleAnalyticsService } from './GoogleAnalyticsService'
import { MixPanelService } from './MixPanelService'

export const AnalyticsService = {
  _initialized: false,

  trackPage(url: string) {
    GoogleAnalyticsService.trackPage(url)
    MixPanelService.trackPage(url)
  },

  sendEvent(event: UaEventOptions) {
    GoogleAnalyticsService.sendEvent(event)
    MixPanelService.sendEvent(event)
  },
}
