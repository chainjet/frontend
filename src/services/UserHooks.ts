import { gql, gql as graphqlTag, OperationVariables } from '@apollo/client'
import { MutationFunctionOptions } from '@apollo/react-common'
import { DocumentNode, QueryHookOptions, useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { destroyCookie as nookiesDestroyCookie, setCookie } from 'nookies'
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
        name
        website
        company
      }
    }
  `
  return useMutation<{ updateOneUser: User }, { input: UpdateOneUserInput }>(mutation)
}

export function useChangePassword() {
  const mutation = gql`
    mutation ($newPassword: String!, $oldPassword: String!) {
      changePassword(newPassword: $newPassword, oldPassword: $oldPassword) {
        id
      }
    }
  `
  return useMutation<{ changePassword: User }, { newPassword: string; oldPassword: string }>(mutation)
}

export function useRegister() {
  const mutation = gql`
    mutation register($email: String!, $username: String!, $password: String!) {
      register(email: $email, username: $username, password: $password) {
        user {
          id
          username
        }
        token {
          accessToken
          accessTokenExpiration
          refreshToken
        }
      }
    }
  `
  const [register] = useMutation(mutation)
  return [
    async <TData>(options?: MutationFunctionOptions<TData, OperationVariables>) => {
      const res = await register(options)
      createCookies(res.data.register)
      return res
    },
  ]
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

export function useVerifyEmail() {
  const mutation = gql`
    mutation verifyEmail($username: String!, $code: String!) {
      verifyEmail(username: $username, code: $code) {
        error
      }
    }
  `
  return useMutation(mutation)
}

export function useRequestPasswordReset() {
  const mutation = gql`
    mutation requestPasswordReset($email: String!) {
      requestPasswordReset(email: $email) {
        result
      }
    }
  `
  return useMutation(mutation)
}

export function useCompletePasswordReset() {
  const mutation = gql`
    mutation completePasswordReset($username: String!, $password: String!, $code: String!) {
      completePasswordReset(username: $username, password: $password, code: $code) {
        error
      }
    }
  `
  return useMutation(mutation)
}

export function useCompleteExternalAuth() {
  const mutation = gql`
    mutation completeExternalAuth($id: String!, $code: String!, $username: String!, $email: String!) {
      completeExternalAuth(id: $id, code: $code, username: $username, email: $email) {
        user {
          id
          username
        }
        token {
          accessToken
          refreshToken
        }
      }
    }
  `
  const [completeSocialAuthentication] = useMutation(mutation)
  return [
    async <TData>(options?: MutationFunctionOptions<TData, OperationVariables>) => {
      const res = await completeSocialAuthentication(options)
      createCookies(res.data.completeExternalAuth)
      return res
    },
  ]
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

function createCookies(data: { token: any; user: User }) {
  const options = {
    path: '/',
    ...(process.env.NEXT_PUBLIC_API_ENDPOINT?.includes('chainjet.io') ? { domain: '.chainjet.io' } : {}),
  }
  setCookie(null, TOKEN_COOKIE_NAME, JSON.stringify(data.token), options)
  refreshApolloClient()
}

function destroyCookie(name: string) {
  nookiesDestroyCookie(null, name)
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}
