import { MailOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { Store } from 'antd/lib/form/interface'
import Head from 'next/head'
import React, { useState } from 'react'
import { SignContainer } from '../../components/users/SignContainer'
import { withApollo } from '../../src/apollo'
import { useRequestPasswordReset } from '../../src/services/UserHooks'
import { getHeadMetatags } from '../../src/utils/html.utils'

const ForgotPasswordPage = () => {
  const [requestPasswordReset] = useRequestPasswordReset()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: Store) => {
    setLoading(true)
    setError(null)
    try {
      await requestPasswordReset({
        variables: {
          email: values.email,
        },
      })
      setEmailSent(true)
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

  const renderForm = () => {
    return (
      <Form name="forgot-password" layout="vertical" onFinish={handleSubmit} onFinishFailed={handleSubmitFail}>
        {renderError()}

        <Form.Item
          label="Email address associated with your account:"
          name="email"
          rules={[{ required: true, message: 'Please enter your email' }]}
        >
          <Input size="large" type="email" placeholder="Email address" prefix={<MailOutlined />} />
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>
            Send reset password email
          </Button>
        </Form.Item>
      </Form>
    )
  }

  const renderEmailSentMessage = () => {
    return (
      <Alert
        message="Rest password email sent."
        description="We sent an email with a link to reset your password. If you don't see it within a few minutes, check your spam folder."
        type="success"
        showIcon
      />
    )
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/login/forgot-password',
          title: 'Reset your password - ChainJet',
          description: 'Reset your ChainJet password.',
        })}
      </Head>

      <SignContainer>{emailSent ? renderEmailSentMessage() : renderForm()}</SignContainer>
    </>
  )
}

export default withApollo(ForgotPasswordPage, { useLayout: false })
