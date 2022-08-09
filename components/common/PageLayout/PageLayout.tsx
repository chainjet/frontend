import React, { CSSProperties, useEffect, useState } from 'react'
import Link from 'next/link'
import { GoKey } from 'react-icons/go'
import './PageLayout.less'
import Icon, {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProjectOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useLogout, useViewer } from '../../../src/services/UserHooks'
import { Dropdown, Layout, Menu } from 'antd'
import { useRouter } from 'next/router'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'

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
      ...(siderCollapsed ? { height: 65 } : { height: 80, marginLeft: 30 }),
    }
    return (
      <Link href="/">
        <a>{/* <img src="/logo-white.svg" style={style} /> */}</a>
      </Link>
    )
  }

  const renderHeaderContent = () => {
    if (viewer) {
      const menu = (
        <Menu>
          {/* <Menu.Item key='profile' onClick={handleProfileClick}>
            <UserOutlined />
            Profile
          </Menu.Item> */}
          <Menu.Item key="settings" onClick={handleSettingsClick}>
            <SettingOutlined />
            Settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="logout" onClick={handleLogoutClick}>
            <LogoutOutlined />
            Logout
          </Menu.Item>
        </Menu>
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

        <Menu theme="dark" mode="inline" defaultSelectedKeys={[router.pathname]}>
          <Menu.Item key="/" icon={<ProjectOutlined />}>
            <Link href="/">Projects</Link>
          </Menu.Item>
          <Menu.Item key="/credentials" icon={<Icon component={GoKey} />}>
            <Link href="/credentials">Credentials</Link>
          </Menu.Item>
        </Menu>
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
