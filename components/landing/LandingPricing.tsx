import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import React from 'react'
import { Pricing10DataSource } from './generated/data.source'
import Pricing1 from './generated/Pricing1'

export function LandingPricing() {
  const breakpoint = useBreakpoint()
  return <Pricing1 id="Pricing1_0" key="Pricing1_0" dataSource={Pricing10DataSource} isMobile={breakpoint.xs} />
}
