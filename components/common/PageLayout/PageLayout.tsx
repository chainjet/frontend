import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ProjectOutlined } from '@ant-design/icons'
import { Dropdown, Layout, Menu } from 'antd'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { CSSProperties, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import ConnectWalletButton from '../../account/ConnectWalletButton'
require('./PageLayout.less')

interface Props {
  children: JSX.Element
}

export default function PageLayout({ children }: Props) {
  const { address, connector, isConnected, isConnecting } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const breakpoint = useBreakpoint()
  const hasMobileSider = breakpoint.xs
  const [siderCollapsed, setSiderCollapsed] = useState(hasMobileSider)

  useEffect(() => {
    setSiderCollapsed(hasMobileSider)
  }, [hasMobileSider])

  const handleSettingsClick = async () => {
    await router.push('/settings')
  }

  const renderLogo = () => {
    const style: CSSProperties = {
      transition: 'all 0.3s',
      ...(siderCollapsed ? { height: 65 } : { height: 80 }),
    }
    return (
      <Link href="/account">
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
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: disconnect as any },
          ]}
        />
      )

      return (
        <Dropdown overlay={menu}>
          <span className="user-menu">
            <span>{ensName ? `${ensName} (${address})` : address}</span>
          </span>
        </Dropdown>
      )
    } else {
      return (
        <div className="mr-4">
          <ConnectWalletButton />
        </div>
      )
    }
  }

  return (
    <Layout hasSider={true} style={{ minHeight: '100vh' }}>
      <Layout.Sider trigger={null} collapsible collapsed={siderCollapsed} collapsedWidth={hasMobileSider ? 0 : 80}>
        {renderLogo()}

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[router.pathname]}
          items={[{ key: '/dashboard', label: <Link href="/dashboard">Dashboard</Link>, icon: <ProjectOutlined /> }]}
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
