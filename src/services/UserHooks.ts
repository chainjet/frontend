import { gql, gql as graphqlTag } from '@apollo/client'
import { DocumentNode, QueryHookOptions, useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { destroyCookie as nookiesDestroyCookie } from 'nookies'
import { useContext, useEffect } from 'react'
import { useDisconnect } from 'wagmi'
import { SignerContext } from '../../components/providers/ViewerContextProvider'
import { UpdateOneUserInput, User } from '../../graphql'
import { refreshApolloClient } from '../apollo'
import { QueryById } from '../typings/GraphQL'
import { getFragmentFirstName } from '../utils/graphql.utils'
import { TOKEN_COOKIE_NAME } from './AuthService'

export function useSigner() {
  return useContext(SignerContext)
}

export function useRedirectGuests() {
  const { signer } = useSigner()
  const router = useRouter()

  useEffect(() => {
    if (!signer) {
      router.push('/login')
    }
  }, [router, signer])

  return { signer }
}

export function useGetViewer(fragment: DocumentNode, options: QueryHookOptions<{ viewer: User }, QueryById>) {
  const fragmentName = getFragmentFirstName(fragment)
  if (!fragmentName) {
    throw new Error('At least one fragment must be provided')
  }
  const query = graphqlTag`
    {
      viewer {
        ...${fragmentName}
      }
    }
    ${fragment}
  `
  return useQuery<{ viewer: User }, QueryById>(query, options)
}

export function useUpdateOneUser() {
  const mutation = gql`
    mutation ($input: UpdateOneUserInput!) {
      updateOneUser(input: $input) {
        id
      }
    }
  `
  return useMutation<{ updateOneUser: User }, { input: UpdateOneUserInput }>(mutation)
}

export function useVerifyEmail() {
  const mutation = gql`
    mutation verifyEmail($address: String!, $code: String!) {
      verifyEmail(address: $address, code: $code) {
        error
      }
    }
  `
  return useMutation(mutation)
}

export function useLogout() {
  const { disconnect } = useDisconnect()
  return [
    async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      } catch (e) {}
      destroyCookie(TOKEN_COOKIE_NAME)
      disconnect()
      refreshApolloClient()
    },
  ]
}

export function useRequestMigration() {
  const mutation = gql`
    mutation requestMigration($email: String!) {
      requestMigration(email: $email) {
        result
      }
    }
  `
  return useMutation(mutation)
}

export function useCompleteMigration() {
  const mutation = gql`
    mutation completeMigration($email: String!, $code: String!, $data: String!) {
      completeMigration(email: $email, code: $code, data: $data) {
        result
      }
    }
  `
  return useMutation(mutation)
}

export function useGenerateApiKey() {
  const mutation = gql`
    mutation generateApiKey {
      generateApiKey {
        apiKey
      }
    }
  `
  return useMutation(mutation)
}

function destroyCookie(name: string) {
  nookiesDestroyCookie(null, name)
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}
