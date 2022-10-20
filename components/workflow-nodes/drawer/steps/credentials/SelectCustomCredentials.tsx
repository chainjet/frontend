import { Alert } from 'antd'
import { IntegrationAccount } from '../../../../../graphql'
import { SelectLensCredentials } from './SelectLensCredentials'

interface Props {
  integrationAccount: IntegrationAccount
  onCredentialsSelected: (id: string) => any
}

export function SelectCustomCredentials({ integrationAccount, onCredentialsSelected }: Props) {
  switch (integrationAccount.key) {
    case 'lens':
      return (
        <SelectLensCredentials integrationAccount={integrationAccount} onCredentialsSelected={onCredentialsSelected} />
      )
  }

  return <Alert type="error" message={`Authentication ${integrationAccount.key} not implemented yet.`} />
}
