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

  const handleXmtpSignIn = useCallback(async () => {
    if (!address || !signer) {
      return
    }
    if ((await signer.getAddress()) !== address) {
      setError(`The message must be signed with the address ${address}`)
      return
    }
    setLoading(true)

    let keys: Uint8Array
    try {
      keys = await Client.getKeys(signer, { env: 'production' })
    } catch (err) {
      setLoading(false)
      setError(`Failed to sign message: ${(err as Error).message}`)
      return
    }

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
      <Button type="primary" onClick={() => handleXmtpSignIn()} loading={loading}>
        Connect to XMTP
      </Button>
      <div className="mt-4">
        <p className="text-gray-400">
          Signing this message will allow ChainJet to read and send XMTP messages on your behalf. The signature will be
          securely stored and will only be accessed to execute your workflows. You can remove the connection at any time
          in the credentials section.
        </p>
      </div>
      {error && (
        <div className="mb-8">
          <Alert message={error} type="error" showIcon />
        </div>
      )}
    </div>
  )
}
