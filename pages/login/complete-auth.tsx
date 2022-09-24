import { MailOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { Store } from 'antd/es/form/interface'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Loading } from '../../components/common/RequestStates/Loading'
import { SignContainer } from '../../components/users/SignContainer'
import { withApollo } from '../../src/apollo'
import { GoogleAnalyticsService } from '../../src/services/GoogleAnalyticsService'
import { useCompleteExternalAuth } from '../../src/services/UserHooks'
import { getQueryParam } from '../../src/utils/nextUtils'

interface Props {
  id: string
  code: string
  provider: string
  completeUsername?: boolean
  completeEmail?: boolean
  email?: string
  redirectTo?: string
}

function CompleteAuthPage({ id, code, provider, completeUsername, completeEmail, email, redirectTo }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completeExternalAuth] = useCompleteExternalAuth()
  const router = useRouter()
  const [gaEventSent, setGaEventSent] = useState(false)

  useEffect(() => {
    ;(async () => {
      // No more data needed, complete authentication now
      if (!completeUsername && !completeEmail) {
        const res = await completeExternalAuth({
          variables: {
            id,
            code,
            email: '',
            username: '',
          },
        })

        if (!gaEventSent) {
          GoogleAnalyticsService.sendEvent({
            action: 'login',
            category: 'engagement',
            label: provider,
          })
          setGaEventSent(true)
        }

        if (redirectTo?.startsWith('/')) {
          router.push(redirectTo)
        } else {
          await router.push('/account')
        }
      }
    })()
  }, [code, completeEmail, completeExternalAuth, completeUsername, gaEventSent, id, provider, redirectTo, router])

  // Authentication was submitted by useEffect
  if (!completeUsername && !completeEmail) {
    return <Loading />
  }

  const handleSubmit = async (values: Store) => {
    setLoading(true)
    setError(null)
    try {
      const res = await completeExternalAuth({
        variables: {
          id,
          code,
          email: values.email,
          username: values.username,
        },
      })

      GoogleAnalyticsService.sendEvent({
        action: 'sign_up',
        category: 'engagement',
        label: provider,
      })

      if (redirectTo?.startsWith('/')) {
        router.push(redirectTo)
      } else {
        await router.push('/account')
      }
    } catch (e: any) {
      setError(e?.message)
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
        <title>Complete Registration</title>
      </Head>
      <SignContainer>
        <Form name="complete-auth" layout="vertical" onFinish={handleSubmit} onFinishFailed={handleSubmitFail}>
          {renderError()}

          <Alert
            style={{ marginBottom: 32 }}
            message="Welcome to ChainJet"
            description="Please make sure your email is correct and choose your username."
          />

          {completeEmail && (
            <Form.Item
              name="email"
              initialValue={email}
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input size="large" placeholder="Email" prefix={<MailOutlined />} />
            </Form.Item>
          )}

          {completeUsername && (
            <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username' }]}>
              <Input size="large" placeholder="Username" prefix={<UserOutlined />} />
            </Form.Item>
          )}

          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>
              Complete Registration
            </Button>
          </Form.Item>
        </Form>
      </SignContainer>
    </>
  )
}

CompleteAuthPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    id: getQueryParam(ctx, 'id'),
    code: getQueryParam(ctx, 'code'),
    provider: getQueryParam(ctx, 'provider'),
    completeUsername: !!getQueryParam(ctx, 'completeUsername'),
    completeEmail: !!getQueryParam(ctx, 'completeEmail'),
    email: getQueryParam(ctx, 'email'),
    redirectTo: getQueryParam(ctx, 'redirect_to'),
  }
}

export default withApollo(CompleteAuthPage, { useLayout: false })
