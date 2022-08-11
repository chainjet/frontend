import { MailOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Alert, Button, Form, Input } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useState } from 'react'
import { User } from '../../../graphql'
import { useUpdateOneUser } from '../../../src/services/UserHooks'

interface Props {
  user: User
}

export function ProfileEmailForm(props: Props) {
  const { user } = props
  const [updateUser] = useUpdateOneUser()
  const [updateLoading, setUpdateLoading] = useState(false)
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
    } catch (e: any) {
      setError(e?.message)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleSubmitFail = (errorInfo: any) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <>
      {error && <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />}

      <Form
        name="profile-public-info"
        initialValues={user}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
      >
        <Form.Item style={{ marginBottom: 16 }} label="Email address" name="email">
          <Input size="large" type="email" placeholder="Email address" prefix={<MailOutlined />} />
        </Form.Item>

        {emailUpdated && (
          <Alert
            style={{ marginBottom: 16 }}
            message="Email updated"
            description="A verification email has been sent to your new email."
            type="info"
            showIcon
          />
        )}

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
    }
  `,
}
