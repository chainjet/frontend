import Head from 'next/head'
import React from 'react'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LandingHeader } from '../components/landing/LandingHeader'
import { LandingPricing } from '../components/landing/LandingPricing'
import { withApollo } from '../src/apollo'
import { getHeadMetatags } from '../src/utils/html.utils'

function PricingPage () {
  return (
    <>
      <Head>
        {
          getHeadMetatags({
            path: '/pricing',
            title: 'ChainJet Pricing',
            description: 'Check out ChainJet pricing plans.'
          })
        }
      </Head>
      <LandingHeader />
      <LandingPricing />
      <LandingFooter />
    </>
  )
}

export default withApollo(PricingPage, { useLayout: false })
