import { LockTwoTone } from '@ant-design/icons'
import { Alert, Button, Form, Input, Typography } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { NextPageContext } from 'next'
import Head from 'next/head'
import Router from 'next/router'
import React, { useState } from 'react'
import { SignContainer } from '../../components/users/SignContainer'
import { withApollo } from '../../src/apollo'
import { useCompletePasswordReset } from '../../src/services/UserHooks'
import { getHeadMetatags } from '../../src/utils/html.utils'
import { getQueryParam } from '../../src/utils/nextUtils'

interface Props {
  code: string
  username: string
}

const PasswordResetPage = (props: Props) => {
  const [completePasswordReset] = useCompletePasswordReset()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: Store) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await completePasswordReset({
        variables: {
          code: props.code,
          username: props.username,
          password: values.password,
        },
      })
      if (res.data?.completePasswordReset?.error) {
        setError(res.data.completePasswordReset.error)
      } else {
        await Router.push('/login?password-changed=1')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFail = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  const renderError = () => {
    return error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/login/password-reset',
          title: 'Complete password reset - ChainJet',
          description: 'Complete your password reset on ChainJet.',
        })}
      </Head>

      <SignContainer>
        <Form name="forgot-password" layout="vertical" onFinish={handleSubmit} onFinishFailed={handleSubmitFail}>
          {renderError()}

          <Typography.Title level={5}>Set your new password:</Typography.Title>

          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
            <Input.Password size="large" placeholder="Password" prefix={<LockTwoTone />} />
          </Form.Item>

          <Form.Item name="confirmPassword" rules={[{ required: true, message: 'Please confirm your password' }]}>
            <Input.Password size="large" placeholder="Confirm Password" prefix={<LockTwoTone />} />
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </SignContainer>
    </>
  )
}

PasswordResetPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    code: getQueryParam(ctx, 'code'),
    username: getQueryParam(ctx, 'username'),
  }
}

export default withApollo(PasswordResetPage, { useLayout: false })
