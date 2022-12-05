import { gql } from '@apollo/client'
import { Alert, Button, Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { AccountCredential, IntegrationAuthType } from '../../graphql'
import { useUpdateOneAccountCredential } from '../../src/services/AccountCredentialHooks'
import { useGetIntegrationAccountById } from '../../src/services/IntegrationAccountHooks'
import { SelectCredentials } from '../workflow-nodes/drawer/steps/credentials/SelectCredentials'

interface Props {
  accountCredential: AccountCredential
  visible: boolean
  onUpdateAccountCredential: (id: string) => any
  onCancel: () => any
}

const integrationAccountFragment = gql`
  fragment UpdateCredentialModalFragment on IntegrationAccount {
    id
    ...SelectCredentials_IntegrationAccount
  }
  ${SelectCredentials.fragments.IntegrationAccount}
`

export const UpdateCredentialModal = ({ accountCredential, visible, onUpdateAccountCredential, onCancel }: Props) => {
  const [updateAccountCredential] = useUpdateOneAccountCredential()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reconnectingAccount, setReconnectingAccount] = useState(false)
  const [name, setName] = useState(accountCredential.name)
  const [form] = Form.useForm()

  const { data } = useGetIntegrationAccountById(integrationAccountFragment, {
    variables: {
      id: accountCredential.integrationAccount.id,
    },
  })
  const integrationAccount = data?.integrationAccount

  useEffect(() => {
    if (integrationAccount?.authType === IntegrationAuthType.apiKey) {
      setReconnectingAccount(true)
    }
  }, [integrationAccount?.authType])

  const handleSubmit = async () => {
    setLoading(true)
    await updateAccountCredential({
      variables: {
        input: {
          id: accountCredential.id,
          update: {
            name,
          },
        },
      },
    })
    setLoading(false)
    onUpdateAccountCredential(accountCredential.id)
  }

  return (
    <Modal
      title="Update Credentials"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      {!reconnectingAccount && (
        <>
          {error && <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />}
          <div className="mb-8">
            <Button type="primary" onClick={() => setReconnectingAccount(true)} loading={!integrationAccount}>
              Reconnect Account
            </Button>
          </div>
          <Form form={form} name="workflow-form" onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="name"
              label="Account Name"
              initialValue={name}
              rules={[{ required: true }]}
              className="mb-8"
            >
              <Input allowClear defaultValue={name} onChange={(e) => setName(e.target.value)} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
      {integrationAccount && reconnectingAccount && (
        <SelectCredentials
          integrationAccount={integrationAccount}
          onCredentialsSelected={onUpdateAccountCredential}
          reconnectAccount={accountCredential}
          hideSubmitButton
        />
      )}
    </Modal>
  )
}
