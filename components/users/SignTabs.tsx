import { LockTwoTone, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Checkbox, Divider, Form, Input, Tabs } from 'antd'
import { Store } from 'antd/lib/form/interface'
import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'
import { GoogleAnalyticsService } from '../../src/services/GoogleAnalyticsService'
import { useLogin, useRegister } from '../../src/services/UserHooks'
import { ExteralLoginButtons } from '../common/ExternalLoginButtons'
import { SignContainer } from './SignContainer'

interface Props {
  defaultTabKey: 'login' | 'register'
  passwordChanged?: boolean
}

export const SignTabs = (props: Props) => {
  const { defaultTabKey, passwordChanged } = props
  const [login] = useLogin()
  const [register] = useRegister()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO implement values.remember
  const handleLogin = async (values: Store) => {
    setLoading(true)
    setError(null)
    try {
      await login({
        variables: {
          username: values.username,
          password: values.password,
        },
      })
      GoogleAnalyticsService.sendEvent({
        action: 'login',
        category: 'engagement',
        label: 'password',
      })
      await redirectAfterAuth('/')
    } catch (e: any) {
      setError(e?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginFail = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  const handleRegister = async (values: Store) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await register({
        variables: {
          email: values.email,
          username: values.username,
          password: values.password,
        },
      })

      GoogleAnalyticsService.sendEvent({
        action: 'sign_up',
        category: 'engagement',
        label: 'password',
      })
      if (res?.data?.register?.project?.slug) {
        await redirectAfterAuth(`/${res.data.register.project.slug}`)
      } else {
        await redirectAfterAuth('/')
      }
    } catch (e: any) {
      setError(e?.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Redirects to the given path after a successful authentication
   * If there was a pending integration OAuth, first redirect to the oauth callback URL
   */
  const redirectAfterAuth = async (redirectTo: string) => {
    const url = new URL(window.location.href)
    const integrationAccountKey = url.searchParams.get('adding_integration_account')
    if (integrationAccountKey) {
      const completeOAuthPath = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/account-credentials/oauth/${integrationAccountKey}/callback${url.search}`
      await Router.push(`${completeOAuthPath}&redirect_to=${redirectTo}`)
    } else {
      await Router.push(redirectTo)
    }
  }

  const handleRegisterFail = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  const handleTabChange = async (tabKey: string) => {
    // query string should be kept because is needed for integration oauth
    const queryString = new URL(window.location.href).search
    await Router.push(`/${tabKey}${queryString}`)
  }

  const renderMessage = () => {
    return (
      passwordChanged && (
        <Alert
          message="Password successfully updated"
          description="You can now login with your new password."
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )
    )
  }

  const renderError = () => {
    return error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />
  }

  return (
    <SignContainer>
      <Tabs defaultActiveKey={defaultTabKey} onChange={handleTabChange} centered>
        <Tabs.TabPane tab="Login" key="login">
          {renderMessage()}
          {renderError()}

          <div style={{ marginTop: 16 }}>
            <ExteralLoginButtons message="Sign in with" />
          </div>
          <Divider style={{ margin: '24px 0' }}>OR</Divider>

          <Form name="login" initialValues={{ remember: true }} onFinish={handleLogin} onFinishFailed={handleLoginFail}>
            <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username' }]}>
              <Input size="large" placeholder="Username or email" prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
              <Input.Password size="large" placeholder="Password" prefix={<LockTwoTone />} />
            </Form.Item>

            <div>
              <Form.Item name="remember" valuePropName="checked" style={{ display: 'inline-block' }}>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link href="/login/forgot-password">
                <a style={{ float: 'right', display: 'flex', minHeight: '32px', alignItems: 'center' }}>
                  Forgot password?
                </a>
              </Link>
            </div>

            <Form.Item>
              <Button block type="primary" htmlType="submit" loading={loading}>
                Login
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Register" key="register">
          {renderError()}

          <div style={{ marginTop: 16 }}>
            <ExteralLoginButtons message="Sign up with" />
          </div>
          <Divider style={{ margin: '24px 0' }}>OR</Divider>

          <Form
            name="register"
            initialValues={{ remember: true }}
            onFinish={handleRegister}
            onFinishFailed={handleRegisterFail}
          >
            <Form.Item name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
              <Input size="large" placeholder="Email" prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username' }]}>
              <Input size="large" placeholder="Username" prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
              <Input.Password size="large" placeholder="Password" prefix={<LockTwoTone />} />
            </Form.Item>

            <Form.Item name="confirmPassword" rules={[{ required: true, message: 'Please confirm your password' }]}>
              <Input.Password size="large" placeholder="Confirm Password" prefix={<LockTwoTone />} />
            </Form.Item>

            <Form.Item>
              <Button block type="primary" htmlType="submit" loading={loading}>
                Register
              </Button>
            </Form.Item>

            <p>
              By creating an account, you confirm that you have read and agree to our&nbsp;
              <Link href="/legal/terms">terms and conditions</Link> and&nbsp;
              <Link href="/legal/privacy">privacy policy</Link>.
            </p>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </SignContainer>
  )
}
