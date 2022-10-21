import { Alert, Button } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { IntegrationAccount } from '../../../../../graphql'
import { useCreateOneAccountCredential } from '../../../../../src/services/AccountCredentialHooks'
import { sendGraphqlQuery } from '../../../../../src/utils/graphql.utils'

interface Props {
  integrationAccount: IntegrationAccount
  onCredentialsSelected: (id: string) => any
}

export function SelectLensCredentials({ integrationAccount, onCredentialsSelected }: Props) {
  const { address } = useAccount()
  const [challenge, setChallenge] = useState<string>()
  const [authLoading, setAuthLoading] = useState(false)
  const [createCredential] = useCreateOneAccountCredential()
  const [error, setError] = useState<string>()
  const {
    data,
    isError,
    isLoading: signLoading,
    signMessage,
    error: signError,
  } = useSignMessage({
    message: challenge,
  })

  useEffect(() => {
    if (challenge) {
      signMessage()
    }
  }, [challenge, signMessage])

  useEffect(() => {
    const authWithLens = async () => {
      setAuthLoading(true)
      const query = `
        mutation Authenticate {
          authenticate(request: {
            address: "${address}",
            signature: "${data}"
          }) {
            accessToken
            refreshToken
          }
        }`
      const res = await sendGraphqlQuery('https://api.lens.dev/', query)
      if (!res?.data?.authenticate) {
        setAuthLoading(false)
        return
      }

      const accessToken = res.data.authenticate.accessToken
      const refreshToken = res.data.authenticate.refreshToken
      if (!accessToken || !refreshToken) {
        setAuthLoading(false)
        return
      }

      const getProfilesQuery = `
        query Profiles {
          profiles(request: { ownedBy: ["${address}"], limit: 50 }) {
            items {
              id
              handle
              isDefault
              dispatcher {
                address
                canUseRelay
              }
            }
          }
        }`
      const profileRes = await sendGraphqlQuery('https://api.lens.dev/', getProfilesQuery)
      if (!profileRes?.data?.profiles?.items?.length) {
        setError(`No lens profiles found for ${address}`)
        setAuthLoading(false)
        return
      }
      const profiles = profileRes.data.profiles.items
      const mainProfile =
        profiles.length === 1 ? profiles[0] : profiles.find((profile: any) => profile.isDefault) ?? profiles[0]

      if (!mainProfile?.id) {
        setError(`No lens profiles found for ${address}`)
        setAuthLoading(false)
        return
      }

      // TODO enable dispatcher
      if (!mainProfile.dispatcher?.address || !mainProfile.dispatcher?.canUseRelay) {
        setError(`Dispatcher must be enable for lens profile ${mainProfile.handle ?? mainProfile.id}`)
        setAuthLoading(false)
        return
      }

      const createCredentialRes = await createCredential({
        variables: {
          input: {
            accountCredential: {
              name: `Lens Profile ${mainProfile.handle ?? mainProfile.id}`,
              integrationAccount: integrationAccount.id,
              credentialInputs: {
                profileId: mainProfile.id,
                accessToken,
                refreshToken,
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
      setAuthLoading(false)
    }

    if (data) {
      authWithLens()
    }
  }, [address, createCredential, data, integrationAccount.id, onCredentialsSelected])

  const handleLensSignIn = useCallback(async () => {
    if (!address) {
      return
    }
    const query = `
    query Challenge {
      challenge(request: { address: "${address}" }) {
        text
      }
    }
    `
    const res = await sendGraphqlQuery('https://api.lens.dev/', query)
    if (res?.data?.challenge?.text) {
      setChallenge(res.data.challenge.text)
    } else {
      setError('Failed to generate signature challenge, please try again.')
    }
  }, [address])

  const loading = signLoading || authLoading

  return (
    <div>
      <Button type="primary" onClick={() => handleLensSignIn()} loading={loading}>
        Sign-In with Lens
      </Button>
      {(error ?? signError) && (
        <div className="mb-8">
          <Alert message={error ?? signError?.message} type="error" showIcon />
        </div>
      )}
    </div>
  )
}
