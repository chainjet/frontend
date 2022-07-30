import { gql, gql as graphqlTag } from '@apollo/client'
import { MutationFunctionOptions } from '@apollo/react-common'
import { DocumentNode, QueryHookOptions, useMutation, useQuery } from '@apollo/react-hooks'
import { destroyCookie as nookiesDestroyCookie, setCookie } from 'nookies'
import { useContext } from 'react'
import { ViewerContext } from '../../components/providers/ViewerContextProvider'
import { UpdateOneUserInput, User } from '../../graphql'
import { refreshApolloClient } from '../apollo'
import { QueryById } from '../typings/GraphQL'
import { getFragmentFirstName } from '../utils/graphql.utils'
import { TOKEN_COOKIE_NAME, USER_COOKIE_NAME } from './AuthService'

export function useViewer () {
  return useContext(ViewerContext)
}

export function useGetViewer (
  fragment: DocumentNode,
  options: QueryHookOptions<{ viewer: User }, QueryById>
) {
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

export function useUpdateOneUser () {
  const mutation = gql`
    mutation ($input: UpdateOneUserInput!) {
      updateOneUser (input: $input) {
        id
        name
        website
        company
      }
    }
  `
  return useMutation<{ updateOneUser: User }, { input: UpdateOneUserInput }>(mutation)
}

export function useChangePassword () {
  const mutation = gql`
    mutation ($newPassword: String!, $oldPassword: String!) {
      changePassword (newPassword: $newPassword, oldPassword: $oldPassword) {
        id
      }
    }
  `
  return useMutation<{ changePassword: User }, { newPassword: string, oldPassword: string }>(mutation)
}

export function useRegister () {
  const mutation = gql`
    mutation register($email: String!, $username: String!, $password: String!) {
      register (email: $email, username: $username, password: $password) {
        user {
          id
          username
        }
        token {
          accessToken
          accessTokenExpiration
          refreshToken
        }
        project {
          id
          slug
        }
      }
    }
  `
  const [register] = useMutation(mutation)
  return [
    async <TData, TVariables> (
      options?: MutationFunctionOptions<TData, TVariables>
    ) => {
      const res = await register(options)
      createCookies(res.data.register)
      return res
    }
  ]
}

export function useLogin () {
  const mutation = gql`
    mutation login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
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
  const [login] = useMutation(mutation)
  return [
    async <TData, TVariables> (
      options?: MutationFunctionOptions<TData, TVariables>
    ) => {
      const res = await login(options)
      createCookies(res.data.login)
      return res
    }
  ]
}

export function useLogout () {
  const mutation = gql`
    mutation logout {
      logout
    }
  `
  const [logout] = useMutation(mutation)
  return [
    async <TData, TVariables> (
      options?: MutationFunctionOptions<TData, TVariables>
    ) => {
      try {
        await logout(options)
      } catch (e) { }
      destroyCookie(USER_COOKIE_NAME)
      destroyCookie(TOKEN_COOKIE_NAME)
      refreshApolloClient()
    }
  ]
}

export function useVerifyEmail () {
  const mutation = gql`
    mutation verifyEmail($username: String!, $code: String!) {
      verifyEmail(username: $username, code: $code) {
        error
      }
    }
  `
  return useMutation(mutation)
}

export function useRequestPasswordReset () {
  const mutation = gql`
    mutation requestPasswordReset($email: String!) {
      requestPasswordReset(email: $email) {
        result
      }
    }
  `
  return useMutation(mutation)
}

export function useCompletePasswordReset () {
  const mutation = gql`
    mutation completePasswordReset(
      $username: String!
      $password: String!
      $code: String!
    ) {
      completePasswordReset(username: $username, password: $password, code: $code) {
        error
      }
    }
  `
  return useMutation(mutation)
}

export function useCompleteExternalAuth () {
  const mutation = gql`
    mutation completeExternalAuth(
      $id: String!
      $code: String!
      $username: String!
      $email: String!
    ) {
      completeExternalAuth (
        id: $id
        code: $code
        username: $username
        email: $email
      ) {
        user {
          id
          username
        }
        token {
          accessToken
          refreshToken
        }
        project {
          id
          slug
        }
      }
    }
  `
  const [completeSocialAuthentication] = useMutation(mutation)
  return [
    async <TData, TVariables> (
      options?: MutationFunctionOptions<TData, TVariables>
    ) => {
      const res = await completeSocialAuthentication(options)
      createCookies(res.data.completeExternalAuth)
      return res
    }
  ]
}

export function useGenerateApiKey () {
  const mutation = gql`
    mutation generateApiKey {
      generateApiKey {
        apiKey
      }
    }
  `
  return useMutation(mutation)
}

function createCookies (data: { token: any, user: User }) {
  setCookie(null, TOKEN_COOKIE_NAME, JSON.stringify(data.token), { path: '/' })
  setCookie(null, USER_COOKIE_NAME, JSON.stringify(data.user), { path: '/' })
  refreshApolloClient()
}

function destroyCookie (name: string) {
  nookiesDestroyCookie(null, name)
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}
