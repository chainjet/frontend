import { LinkOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Alert, Button, Form, Input } from 'antd'
import { Store } from 'antd/lib/form/interface'
import React, { useState } from 'react'
import { User } from '../../../graphql'
import { useUpdateOneUser } from '../../../src/services/UserHooks'

interface Props {
  user: User
}

export function ProfilePublicInfoForm(props: Props) {
  const { user } = props
  const [updateUser] = useUpdateOneUser()
  const [updateLoading, setUpdateLoading] = useState(false)
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
    } catch (e) {
      setError(e.message)
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
        <Form.Item style={{ marginBottom: 16 }} label="Name" name="name">
          <Input size="large" prefix={<UserOutlined />} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }} label="Website" name="website">
          <Input size="large" type="url" prefix={<LinkOutlined />} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }} label="Company" name="company">
          <Input size="large" prefix={<ShopOutlined />} />
        </Form.Item>

        <Form.Item style={{ marginTop: 28 }}>
          <div style={{ marginBottom: 16 }}>
            All of these fields might be appear in your public profile. These fields are optional anc can be deleted at
            any time.
          </div>
          <Button type="primary" htmlType="submit" loading={updateLoading}>
            Update
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

ProfilePublicInfoForm.fragments = {
  User: gql`
    fragment ProfilePublicInfoForm_User on User {
      id
      name
      website
      company
    }
  `,
}
