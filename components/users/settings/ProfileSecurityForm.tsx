import { LockTwoTone } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useState } from 'react'
import { User } from '../../../graphql'
import { useChangePassword } from '../../../src/services/UserHooks'

interface Props {
  user: User
}

export function ProfileSecurityForm(props: Props) {
  const { user } = props
  const [changePassword] = useChangePassword()
  const [updateLoading, setUpdateLoading] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: Store) => {
    if (values.newPassword !== values.confirmNewPassword) {
      setError('Passwords do not match.')
      return
    }

    setUpdateLoading(true)
    setError(null)
    try {
      await changePassword({
        variables: {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
      })
      setPasswordUpdated(true)
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

      {!error && passwordUpdated && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Success"
          description="Password updated successfully."
          type="success"
          showIcon
        />
      )}

      <Form name="profile-public-info" layout="vertical" onFinish={handleSubmit} onFinishFailed={handleSubmitFail}>
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={[{ required: true, message: 'Your old password is required' }]}
        >
          <Input.Password size="large" prefix={<LockTwoTone />} />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please enter a password' }]}
        >
          <Input.Password size="large" prefix={<LockTwoTone />} />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmNewPassword"
          rules={[{ required: true, message: 'Please confirm your password' }]}
        >
          <Input.Password size="large" prefix={<LockTwoTone />} />
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={updateLoading}>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
