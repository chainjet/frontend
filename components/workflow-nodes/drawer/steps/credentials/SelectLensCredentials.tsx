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
      }
      `
      const res = await sendGraphqlQuery('https://api.lens.dev/', query)
      if (res?.data?.authenticate) {
        const accessToken = res.data.authenticate.accessToken
        const refreshToken = res.data.authenticate.refreshToken
        if (accessToken && refreshToken) {
          const getProfileQuery = `
          query DefaultProfile {
            defaultProfile(request: { ethereumAddress: "${address}"}) {
              id
              handle
              dispatcher {
                address
                canUseRelay
              }
            }
          }`
          const profileRes = await sendGraphqlQuery('https://api.lens.dev/', getProfileQuery)
          if (profileRes?.data?.defaultProfile?.id) {
            const profileId = profileRes.data.defaultProfile.id
            const dispatcher = profileRes.data.defaultProfile.dispatcher
            if (dispatcher?.address && dispatcher?.canUseRelay) {
              const res = await createCredential({
                variables: {
                  input: {
                    accountCredential: {
                      name: profileRes.data.defaultProfile.handle ?? profileRes.data.defaultProfile.id,
                      integrationAccount: integrationAccount.id,
                      credentialInputs: {
                        profileId,
                        accessToken,
                        refreshToken,
                      },
                    },
                  },
                },
              })
              if (res.data?.createOneAccountCredential?.id) {
                await onCredentialsSelected(res.data.createOneAccountCredential.id)
              } else {
                setError('Failed to create account credential')
              }
            } else {
              // TODO enable dispatcher
            }
          } else {
            setError(`No lens profile found for address ${address}`)
          }
        }
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
