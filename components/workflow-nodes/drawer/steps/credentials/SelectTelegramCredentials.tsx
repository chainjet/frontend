import { Alert, Button } from 'antd'
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
    <div>
      <div className="mb-4">
        <a href={`https://t.me/ChainJetBot?startgroup=${connectTelegramData}`} target="_blank" rel="noreferrer">
          <Button type="primary" loading={loading}>
            Connect to group or channel
          </Button>
        </a>
      </div>
      <div>
        <a href={`https://t.me/ChainJetBot?start=${connectTelegramData}`} target="_blank" rel="noreferrer">
          <Button type="primary" loading={loading}>
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
