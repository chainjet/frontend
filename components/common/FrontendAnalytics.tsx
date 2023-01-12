import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { AnalyticsService } from '../../src/services/AnalyticsService'

export function FrontendAnalytics() {
  const router = useRouter()

  useEffect(() => {
    AnalyticsService.trackPage(router.asPath)
  }, [router])

  return <></>
}
