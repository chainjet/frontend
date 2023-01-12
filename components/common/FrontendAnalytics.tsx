import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { GoogleAnalyticsService } from '../../src/services/GoogleAnalyticsService'
import { MixPanelService } from '../../src/services/MixPanelService'

export function FrontendAnalytics() {
  const router = useRouter()

  useEffect(() => {
    GoogleAnalyticsService.trackPage(router.asPath)
    MixPanelService.trackPage(router.asPath)
  }, [router])

  return <></>
}
