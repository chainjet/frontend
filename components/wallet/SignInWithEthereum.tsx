import { Alert } from 'antd'
import { setCookie } from 'nookies'
import { useEffect, useState } from 'react'
import { SiweMessage } from 'siwe'
import { useAccount, useNetwork, useSignMessage } from 'wagmi'
import { refreshApolloClient } from '../../src/apollo'
import { TOKEN_COOKIE_NAME } from '../../src/services/AuthService'
import { Loading } from '../common/RequestStates/Loading'

export function SignInWithEthereum({
  onSuccess,
  onError,
  beforeLogin,
}: {
  onSuccess: (args: { address: string }) => void
  onError: (args: { error: Error }) => void
  beforeLogin?: (data: string) => Promise<boolean>
}) {
  const { address } = useAccount()
  const { chain: activeChain } = useNetwork()
  const { signMessageAsync } = useSignMessage()
  const [state, setState] = useState<{
    loading?: boolean
    nonce?: string
    error?: Error
  }>({})

  const fetchNonce = async () => {
    try {
      const nonceRes = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/nonce`, {
        method: 'POST',
        credentials: 'include',
      })
      const nonce = await nonceRes.text()
      setState((x) => ({ ...x, nonce }))
    } catch (error) {
      setState((x) => ({ ...x, error: error as Error }))
    }
  }

  useEffect(() => {
    fetchNonce()
  }, [])

  if (state.error) {
    return <Alert message={state.error?.message} type="error" showIcon style={{ marginBottom: 24 }} />
  }
  if (!state.nonce) {
    return <Loading />
  }

  const signIn = async () => {
    try {
      const chainId = activeChain?.id
      if (!address || !chainId) {
        return
      }

      setState((x) => ({ ...x, loading: true }))
      // Create SIWE message with pre-fetched nonce and sign with wallet
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign-In on ChainJet.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce: state.nonce,
      })
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      })

      if (beforeLogin) {
        const canContinue = await beforeLogin(JSON.stringify({ message, signature }))
        if (!canContinue) {
          setState((x) => ({ ...x, loading: false }))
          return
        }
      }

      // Do login
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
        credentials: 'include',
      })
      if (!loginRes.ok) {
        throw new Error('Error verifying message')
      }

      const options = {
        path: '/',
        ...(process.env.NEXT_PUBLIC_API_ENDPOINT?.includes('chainjet.io') ? { domain: '.chainjet.io' } : {}),
      }
      setCookie(
        null,
        TOKEN_COOKIE_NAME,
        JSON.stringify({ address, token: JSON.stringify({ message, signature }) }),
        options,
      )
      refreshApolloClient()
      onSuccess({ address })
    } catch (error) {
      setState((x) => ({ ...x, loading: false, nonce: undefined }))
      onError({ error: error as Error })
      fetchNonce()
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <div className="mb-2 text-lg">Sign the message to login</div>
        <div>
          ChainJet uses Sign-In with Ethereum for authentication (
          <a href="https://eips.ethereum.org/EIPS/eip-4361" target="_blank" rel="noreferrer noopener nofollow">
            EIP-4361
          </a>
          )
        </div>
      </div>
      <button
        className="inline-flex items-center justify-center w-full px-4 py-2 mb-4 text-xl text-white rounded cursor-pointer bg-primary hover:bg-primary-hover"
        disabled={!state.nonce || state.loading}
        onClick={signIn}
      >
        {state.loading ? <Loading /> : 'Sign-In with Ethereum'}
      </button>
    </>
  )
}
