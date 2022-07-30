import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import React from 'react'
import { Footer10DataSource } from './generated/data.source'
import Footer from './generated/Footer1'

export function LandingFooter () {
  const breakpoint = useBreakpoint()
  return (
    <Footer
      id="Footer1_0"
      key="Footer1_0"
      dataSource={Footer10DataSource}
      isMobile={breakpoint.xs}
    />
  )
}
