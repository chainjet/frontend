import { MailOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Alert, Button, Checkbox, Form, Input } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useState } from 'react'
import { User } from '../../../graphql'
import { useUpdateOneUser } from '../../../src/services/UserHooks'

interface Props {
  user: User
  subscriptionsDefaultEnabled?: boolean
  onUserUpdate?: () => any
}

export function ProfileEmailForm({ user, subscriptionsDefaultEnabled, onUserUpdate }: Props) {
  const [updateUser] = useUpdateOneUser()
  const [updateLoading, setUpdateLoading] = useState(false)
  const [valuesUpdated, setValuesUpdated] = useState(false)
  const [emailUpdated, setEmailUpdated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: Store) => {
    setUpdateLoading(true)
    setError(null)
    try {
      await updateUser({
        variables: {
          input: {
            id: user.id,
            update: values,
          },
        },
      })

      if (user.email !== values.email) {
        setEmailUpdated(true)
      }
      setValuesUpdated(true)
      onUserUpdate?.()
    } catch (e: any) {
      setError(e?.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleSubmitFail = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
    setError(errorInfo?.errorFields?.[0].errors?.[0])
  }

  return (
    <>
      {error && <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />}

      {valuesUpdated && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Email settings updated"
          description={emailUpdated ? 'Please check your email to confirm your new email address.' : null}
          type="success"
          showIcon
        />
      )}

      <Form
        name="profile-email"
        initialValues={{
          ...user,
          subscribedToNotifications: subscriptionsDefaultEnabled ?? user.subscribedToNotifications,
          subscribedToNewsletter: subscriptionsDefaultEnabled ?? user.subscribedToNewsletter,
        }}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
      >
        <Form.Item className="mb-8" label="Email address" name="email">
          <Input size="large" type="email" placeholder="Email address" prefix={<MailOutlined />} />
        </Form.Item>

        <Form.Item name="subscribedToNotifications" valuePropName="checked">
          <Checkbox>Subscribe to important notifications about your workflows.</Checkbox>
        </Form.Item>

        <Form.Item name="subscribedToNewsletter" valuePropName="checked">
          <Checkbox>Subscribe to our monthly Newsletter.</Checkbox>
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={updateLoading}>
            Update
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

ProfileEmailForm.fragments = {
  User: gql`
    fragment ProfileEmailForm_User on User {
      id
      email
      subscribedToNotifications
      subscribedToNewsletter
    }
  `,
}
