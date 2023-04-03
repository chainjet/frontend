import { Alert, Button, Divider } from 'antd'
import { AccountCredential, IntegrationAccount } from '../../../../../graphql'
import { useAccountCreationData } from '../../../../../src/services/AccountCredentialHooks'

interface Props {
  integrationAccount: IntegrationAccount
  reconnectAccount?: AccountCredential
  onCredentialsSelected: (id: string) => any
}

export function SelectTelegramCredentials({}: Props) {
  const { data, loading, error } = useAccountCreationData('telegram')

  const connectTelegramData = data?.accountCreationData?.data?.key

  return (
    <div style={{ width: 220 }}>
      <div className="mt-4">
        <a href={`https://t.me/ChainJetBot?startgroup=${connectTelegramData}`} target="_blank" rel="noreferrer">
          <Button type="primary" loading={loading} style={{ width: 220 }}>
            Connect to group
          </Button>
        </a>
      </div>
      <Divider>or</Divider>
      <div>
        <a href={`https://t.me/ChainJetBot?start=${connectTelegramData}`} target="_blank" rel="noreferrer">
          <Button type="primary" loading={loading} style={{ width: 220 }}>
            Connect to private chat
          </Button>
        </a>
      </div>
      {error && (
        <div className="mb-8">
          <Alert message={error} type="error" showIcon />
        </div>
      )}
    </div>
  )
}
