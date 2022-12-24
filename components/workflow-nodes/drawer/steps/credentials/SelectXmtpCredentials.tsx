import { Client } from '@xmtp/xmtp-js'
import { Alert, Button } from 'antd'
import { useCallback, useState } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { AccountCredential, IntegrationAccount } from '../../../../../graphql'
import {
  useCreateOneAccountCredential,
  useUpdateOneAccountCredential,
} from '../../../../../src/services/AccountCredentialHooks'

interface Props {
  integrationAccount: IntegrationAccount
  reconnectAccount?: AccountCredential
  onCredentialsSelected: (id: string) => any
}

export function SelectXmtpCredentials({ integrationAccount, reconnectAccount, onCredentialsSelected }: Props) {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [createCredential] = useCreateOneAccountCredential()
  const [updateCredential] = useUpdateOneAccountCredential()
  const [error, setError] = useState<string>()

  const { data: signer } = useSigner()

  const handleLensSignIn = useCallback(async () => {
    if (!address || !signer) {
      return
    }
    if ((await signer.getAddress()) !== address) {
      setError(`The message must be signed with the address ${address}`)
      return
    }
    setLoading(true)

    const keys = await Client.getKeys(signer, { env: 'production' })
    if (reconnectAccount) {
      const createCredentialRes = await updateCredential({
        variables: {
          input: {
            id: reconnectAccount.id,
            update: {
              credentialInputs: {
                keys: keys.toString(),
              },
            },
          },
        },
      })
      if (createCredentialRes.data?.updateOneAccountCredential?.id) {
        await onCredentialsSelected(createCredentialRes.data.updateOneAccountCredential.id)
      } else {
        setError('Failed to create account credential')
      }
    } else {
      const createCredentialRes = await createCredential({
        variables: {
          input: {
            accountCredential: {
              name: 'XMTP account',
              integrationAccount: integrationAccount.id,
              credentialInputs: {
                keys: keys.toString(),
              },
            },
          },
        },
      })
      if (createCredentialRes.data?.createOneAccountCredential?.id) {
        await onCredentialsSelected(createCredentialRes.data.createOneAccountCredential.id)
      } else {
        setError('Failed to create account credential')
      }
    }

    setLoading(false)
  }, [
    address,
    createCredential,
    integrationAccount.id,
    onCredentialsSelected,
    reconnectAccount,
    signer,
    updateCredential,
  ])

  return (
    <div>
      <Button type="primary" onClick={() => handleLensSignIn()} loading={loading}>
        Connect to XMTP
      </Button>
      {error && (
        <div className="mb-8">
          <Alert message={error} type="error" showIcon />
        </div>
      )}
    </div>
  )
}
