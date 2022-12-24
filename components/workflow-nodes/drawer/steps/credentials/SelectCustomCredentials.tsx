import { Alert } from 'antd'
import { AccountCredential, IntegrationAccount } from '../../../../../graphql'
import { SelectLensCredentials } from './SelectLensCredentials'
import { SelectXmtpCredentials } from './SelectXmtpCredentials'

interface Props {
  integrationAccount: IntegrationAccount
  reconnectAccount?: AccountCredential
  onCredentialsSelected: (id: string) => any
}

export function SelectCustomCredentials({ integrationAccount, reconnectAccount, onCredentialsSelected }: Props) {
  switch (integrationAccount.key) {
    case 'lens':
      return (
        <SelectLensCredentials
          integrationAccount={integrationAccount}
          onCredentialsSelected={onCredentialsSelected}
          reconnectAccount={reconnectAccount}
        />
      )
    case 'xmtp':
      return (
        <SelectXmtpCredentials
          integrationAccount={integrationAccount}
          onCredentialsSelected={onCredentialsSelected}
          reconnectAccount={reconnectAccount}
        />
      )
  }

  return <Alert type="error" message={`Authentication ${integrationAccount.key} not implemented yet.`} />
}
