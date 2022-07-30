import React, { useState } from 'react'
import TweenOne from 'rc-tween-one'
import { IAnimObject } from 'rc-tween-one/typings/AnimObject'
import QueueAnim from 'rc-queue-anim'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import './LandingHeader.less'

export function LandingHeader () {
  const router = useRouter()
  const breakpoint = useBreakpoint()
  const [openAnim, setOpenAnim] = useState<IAnimObject | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [barAnim, setBarAnim] = useState<IAnimObject[]>([])
  const useMobileMenu = breakpoint.xs || (breakpoint.sm && !breakpoint.md)

  const getAnimData = (mobileOpen: any): { mobileMenuOpen: boolean, openAnim: IAnimObject, barAnim: IAnimObject[] } =>
    mobileOpen
      ? {
        mobileMenuOpen: false,
        openAnim: { opacity: 0, delay: 300, duration: 400 },
        barAnim: [
          { rotate: 0, y: 0, duration: 300 },
          { opacity: 1, duration: 300 },
          { rotate: 0, y: 0, duration: 300 },
        ],
      }
      : {
        mobileMenuOpen: true,
        openAnim: { opacity: 1, duration: 400 },
        barAnim: [
          { rotate: 45, y: 6, duration: 300 },
          { opacity: 0, duration: 300 },
          { rotate: -45, y: -6, duration: 300 },
        ],
      }

  const mobileClick = () => {
    const animData = getAnimData(mobileMenuOpen)
    setOpenAnim(animData.openAnim)
    setMobileMenuOpen(animData.mobileMenuOpen)
    setBarAnim(animData.barAnim)
  }

  const navItems = [
    {
      name: 'Integrations',
      href: '/integrations'
    },
    {
      name: 'Pricing',
      href: '/pricing'
    },
    {
      name: 'Login',
      href: '/login'
    },
    {
      name: 'Register',
      href: '/register'
    }
  ]
  const navContent = navItems.map(item => (
    <li key={item.href}>
      <Link href={item.href}>
        <a className={router.pathname === item.href ? 'active' : ''} onClick={() => mobileClick()}>
          {item.name}
        </a>
      </Link>
    </li>
  ))

  return (
    <header className={`header-wrapper${mobileMenuOpen ? ' open' : ''}`}>
      <div className="header">
        <TweenOne
          className="header-logo"
          animation={{ opacity: 0, type: 'from' }}
        >
          <Link href={'/'} key="logo">
            <a onClick={() => mobileClick()}>
              <img className="logo-img" alt="ChainJet" height="80" src="/logo-white.svg" />
            </a>
          </Link>
        </TweenOne>

        {
          useMobileMenu
            ? (
              <div className="mobile-nav">
                <div className="mobile-nav-bar" onClick={() => mobileClick()}>
                  <TweenOne component="em" animation={barAnim[0]} />
                  <TweenOne component="em" animation={barAnim[1]} />
                  <TweenOne component="em" animation={barAnim[2]} />
                </div>

                <TweenOne
                  className="mobile-nav-text-wrapper"
                  animation={openAnim ?? {}}
                  style={{ pointerEvents: mobileMenuOpen ? 'auto' : 'none' }}
                >
                  <QueueAnim
                    component="ul"
                    duration={150}
                    interval={50}
                    delay={[200, 0]}
                    ease={['easeOutQuad', 'easeInQuad']}
                    type="bottom"
                    leaveReverse
                  >
                    {mobileMenuOpen && navContent}
                  </QueueAnim>
                </TweenOne>

              </div>
            )
            : (
              <TweenOne
                component="nav"
                className="web-nav"
                animation={{ opacity: 0, type: 'from' }}
              >
                <ul>
                  {navContent}
                </ul>
              </TweenOne>
            )
        }
      </div>
    </header>
  )
}
