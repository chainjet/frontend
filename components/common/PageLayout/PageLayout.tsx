import {
  FileOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ProfileOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Button, Divider, Dropdown, Layout, Menu } from 'antd'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { CSSProperties, useEffect, useState } from 'react'
import { GoKey } from 'react-icons/go'
import { useAccount } from 'wagmi'
import { useLogout, useSigner } from '../../../src/services/UserHooks'
import { useCreateOneWorkflow } from '../../../src/services/WorkflowHooks'
import { getLoginUrl } from '../../../src/utils/account.utils'
import { isBrowser } from '../../../src/utils/environment'
import { LandingFooter } from '../../landing/LandingFooter'
import { Address } from '../../wallet/Address'
import { ConnectWalletButton } from '../../wallet/ConnectWalletButton'
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
  const [createWorkflow] = useCreateOneWorkflow()
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const [workflowError, setWorkflowError] = useState<string | null>(null)

  useEffect(() => {
    setSiderCollapsed(hasMobileSider)
  }, [hasMobileSider])

  useEffect(() => {
    if (signer !== address) {
      router.push(getLoginUrl(router))
    }
  })

  const handleSettingsClick = async () => {
    await router.push('/settings')
  }

  const handleLogoutClick = async () => {
    await logout()
    window.location.href = '/'
  }

  const handleCreateWorkflow = async () => {
    setWorkflowLoading(true)
    try {
      const workflowRes = await createWorkflow({
        variables: {
          input: {
            workflow: {
              name: 'Untitled Workflow',
            },
          },
        },
      })
      const workflowId = workflowRes.data?.createOneWorkflow?.id
      if (workflowId) {
        await router.push(`/workflows/${workflowId}`)
      } else {
        setWorkflowError('Unexpected error, please try again')
        setWorkflowLoading(false)
      }
    } catch (e: any) {
      setWorkflowError(e.message)
      setWorkflowLoading(false)
    }
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
            <span>
              <Address address={address} />
            </span>
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

  if (isBrowser && signer !== address) {
    return <></>
  }

  return (
    <Layout hasSider={true} style={{ minHeight: '100vh' }}>
      <Layout.Sider trigger={null} collapsible collapsed={siderCollapsed} collapsedWidth={hasMobileSider ? 0 : 80}>
        {renderLogo()}

        <div className="flex justify-center mt-2 mb-6">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateWorkflow} loading={workflowLoading}>
            Create Workflow
          </Button>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[router.pathname]}
          items={
            address
              ? [
                  { key: '/dashboard', label: <Link href="/dashboard">Dashboard</Link>, icon: <ProjectOutlined /> },
                  { key: '/workflows', label: <Link href="/workflows">Workflows</Link>, icon: <ProfileOutlined /> },
                  { key: '/credentials', label: <Link href="/credentials">Credentials</Link>, icon: <GoKey /> },
                  { key: 'divider1', label: <Divider style={{ backgroundColor: '#ff9c00' }} /> },
                  {
                    key: 'documentation',
                    label: (
                      <a href="https://docs.chainjet.io" target="_blank" rel="noopener noreferrer">
                        Docs
                      </a>
                    ),
                    icon: <FileOutlined />,
                  },
                  {
                    key: 'get-help',
                    label: (
                      <a href="https://discord.gg/QFnSwqj9YH" target="_blank" rel="noopener noreferrer">
                        Get Help
                      </a>
                    ),
                    icon: <QuestionCircleOutlined />,
                  },
                ]
              : [
                  {
                    key: '/login',
                    label: <Link href={getLoginUrl(router)}>Connect Wallet</Link>,
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

        <LandingFooter />
      </Layout>
    </Layout>
  )
}
