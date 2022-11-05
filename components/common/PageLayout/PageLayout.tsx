import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusSquareOutlined,
  ProjectOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Layout, Menu } from 'antd'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { CSSProperties, useEffect, useState } from 'react'
import { GoKey } from 'react-icons/go'
import { useAccount, useEnsName } from 'wagmi'
import { useLogout, useSigner } from '../../../src/services/UserHooks'
import { shortenAddress } from '../../../src/utils/strings'
require('./PageLayout.less')

interface Props {
  children: JSX.Element
}

export default function PageLayout({ children }: Props) {
  const { signer } = useSigner()
  const router = useRouter()
  const breakpoint = useBreakpoint()
  const hasMobileSider = breakpoint.xs
  const [siderCollapsed, setSiderCollapsed] = useState(hasMobileSider)
  const [logout] = useLogout()
  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address })

  useEffect(() => {
    setSiderCollapsed(hasMobileSider)
  }, [hasMobileSider])

  useEffect(() => {
    if (signer !== address) {
      router.push(`/login?go=${router.asPath}`)
    }
  })

  const handleSettingsClick = async () => {
    await router.push('/settings')
  }

  const handleLogoutClick = async () => {
    await logout()
    window.location.href = '/'
  }

  const renderLogo = () => {
    const style: CSSProperties = {
      transition: 'all 0.3s',
      ...(siderCollapsed ? { height: 65 } : { height: 80 }),
    }
    return (
      <Link href="/dashboard">
        <a>
          <img src={siderCollapsed ? '/icon.svg' : '/logo.svg'} style={style} alt="ChainJet Logo" width="100%" />
        </a>
      </Link>
    )
  }

  const renderHeaderContent = () => {
    if (address) {
      const menu = (
        <Menu
          items={[
            // { key: 'settings', label: 'Settings', icon: <SettingOutlined />, onClick: handleSettingsClick },
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogoutClick },
          ]}
        />
      )

      return (
        <Dropdown overlay={menu}>
          <span className="user-menu">
            <span>{ensName ? ensName : shortenAddress(address)}</span>
          </span>
        </Dropdown>
      )
    } else {
      return (
        <div className="mr-4">
          <Button type="primary" href={`/login?go=${router.asPath}`}>
            Connect Wallet
          </Button>
        </div>
      )
    }
  }

  if (signer !== address) {
    return <></>
  }

  return (
    <Layout hasSider={true} style={{ minHeight: '100vh' }}>
      <Layout.Sider trigger={null} collapsible collapsed={siderCollapsed} collapsedWidth={hasMobileSider ? 0 : 80}>
        {renderLogo()}

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[router.pathname]}
          items={
            address
              ? [
                  {
                    key: '/create/notification',
                    label: <Link href="/create/notification">Create Notification</Link>,
                    icon: <PlusSquareOutlined />,
                  },
                  { key: '/dashboard', label: <Link href="/dashboard">Dashboard</Link>, icon: <ProjectOutlined /> },
                  { key: '/credentials', label: <Link href="/credentials">Credentials</Link>, icon: <GoKey /> },
                ]
              : [
                  {
                    key: '/login',
                    label: <Link href={`/login?go=${router.asPath}`}>Connect Wallet</Link>,
                    icon: <WalletOutlined />,
                  },
                ]
          }
        />
      </Layout.Sider>

      <Layout>
        <Layout.Header className="layout-header" style={{ padding: 0 }}>
          {React.createElement(siderCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'toggle-sider',
            onClick: () => setSiderCollapsed(!siderCollapsed),
          })}
          <div style={{ flex: '1 1 0%' }} />
          {renderHeaderContent()}
        </Layout.Header>

        <Layout.Content>{children}</Layout.Content>

        <Layout.Footer>
          <div>
            <a href="mailto:admin@chainjet.io">Contact Us</a> |&nbsp;
            <Link href="/legal/terms">
              <a>Terms</a>
            </Link>{' '}
            |{' '}
            <Link href="/legal/privacy">
              <a>Privacy</a>
            </Link>
          </div>
        </Layout.Footer>
      </Layout>
    </Layout>
  )
}
