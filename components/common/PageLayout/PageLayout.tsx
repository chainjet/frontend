import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusSquareOutlined,
  ProjectOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Dropdown, Layout, Menu } from 'antd'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { CSSProperties, useState } from 'react'
import { GoKey } from 'react-icons/go'
import { useLogout, useViewer } from '../../../src/services/UserHooks'
require('./PageLayout.less')

interface Props {
  children: JSX.Element
}

export default function PageLayout({ children }: Props) {
  const { viewer } = useViewer()
  const router = useRouter()
  const breakpoint = useBreakpoint()
  const hasMobileSider = breakpoint.xs
  const [siderCollapsed, setSiderCollapsed] = useState(true)
  const [logout] = useLogout()

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
      <Link href="/">
        <a>
          <img src={siderCollapsed ? '/icon.svg' : '/logo.svg'} style={style} alt="ChainJet Logo" width="100%" />
        </a>
      </Link>
    )
  }

  const renderHeaderContent = () => {
    if (viewer) {
      const menu = (
        <Menu
          items={[
            { key: 'settings', label: 'Settings', icon: <SettingOutlined />, onClick: handleSettingsClick },
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, onClick: handleLogoutClick },
          ]}
        />
      )

      return (
        <Dropdown overlay={menu}>
          <span className="user-menu">
            <span>{viewer.username}</span>
          </span>
        </Dropdown>
      )
    } else {
      return <Link href="/login">Login</Link>
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
          items={[
            {
              key: '/create/notification',
              label: <Link href="/create/notification">Create Notification</Link>,
              icon: <PlusSquareOutlined />,
            },
            { key: '/', label: <Link href="/">Projects</Link>, icon: <ProjectOutlined /> },
            { key: '/credentials', label: <Link href="/credentials">Credentials</Link>, icon: <GoKey /> },
          ]}
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
