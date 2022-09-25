import { MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input } from 'antd'
import { Store } from 'antd/lib/form/interface'
import Head from 'next/head'
import { useState } from 'react'
import { SignContainer } from '../../components/users/SignContainer'
import { withApollo } from '../../src/apollo'
import { useRequestMigration } from '../../src/services/UserHooks'
import { getHeadMetatags } from '../../src/utils/html.utils'

interface Props {}

const LoginPage = ({}: Props) => {
  const [requestMigration] = useRequestMigration()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: Store) => {
    setLoading(true)
    setError(null)
    try {
      await requestMigration({
        variables: {
          email: values.email,
        },
      })
      setEmailSent(true)
    } catch (e: any) {
      setError(e?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFail = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/migrate',
          title: 'ChainJet - Migrate',
          description: 'Migrate yout ChainJet account',
        })}
      </Head>
      <SignContainer>
        {emailSent ? (
          <Alert
            message="Verification email sent."
            description="We sent an email with a link to migrate your account. If you don't see it within a few minutes, check your spam folder."
            type="success"
            showIcon
          />
        ) : (
          <Card>
            <Form name="migrate-accoint" layout="vertical" onFinish={handleSubmit} onFinishFailed={handleSubmitFail}>
              {error && (
                <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />
              )}

              <Form.Item
                style={{ color: 'white' }}
                label="Email address associated with your account:"
                name="email"
                rules={[{ required: true, message: 'Please enter your email' }]}
              >
                <Input size="large" type="email" placeholder="Email address" prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button block type="primary" htmlType="submit" loading={loading}>
                  Get verification email
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </SignContainer>
    </>
  )
}

export default withApollo(LoginPage, { useLayout: false, ssr: false })
