import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/react-hooks'
import fetch from 'isomorphic-unfetch'
import { NextPageContext } from 'next'
import { parseCookies } from 'nookies'
import PageLayout from '../components/common/PageLayout/PageLayout'
import SignerContextProvider from '../components/providers/SignerContextProvider'
import ViewerContextProvider from '../components/providers/ViewerContextProvider'
import { AuthService, TOKEN_COOKIE_NAME } from './services/AuthService'

let globalApolloClient: ApolloClient<NormalizedCacheObject> | null = null

export function refreshApolloClient() {
  globalApolloClient = null
}

type ApolloPageContext = NextPageContext & { apolloClient: ApolloClient<NormalizedCacheObject> }

interface UserToken {
  address: string
  token: string
}

interface WithApolloProps {
  apolloClient?: ApolloClient<NormalizedCacheObject>
  apolloState?: NormalizedCacheObject
  token?: UserToken
  signer?: string
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 */
export function withApollo(PageComponent: any, { useLayout = true, ssr = true } = {}) {
  const WithApollo = ({ apolloClient, apolloState, token, signer, ...pageProps }: WithApolloProps) => {
    const client = apolloClient || initApolloClient(apolloState, token)
    const pageComponent = <PageComponent {...pageProps} />
    return (
      <SignerContextProvider signer={signer}>
        <ApolloProvider client={client}>
          <ViewerContextProvider signer={signer}>
            {useLayout ? <PageLayout>{pageComponent}</PageLayout> : pageComponent}
          </ViewerContextProvider>
        </ApolloProvider>
      </SignerContextProvider>
    )
  }

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName = PageComponent.displayName || PageComponent.name || 'Component'

    if (displayName === 'App') {
      console.warn('This withApollo HOC only works with PageComponents.')
    }

    WithApollo.displayName = `withApollo(${displayName})`
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx: ApolloPageContext): Promise<WithApolloProps> => {
      const { AppTree } = ctx
      const signer = new AuthService(ctx).getSigner()

      const tokensJson = parseCookies(ctx || null)[TOKEN_COOKIE_NAME]
      let token: UserToken | undefined = undefined
      if (tokensJson) {
        try {
          token = JSON.parse(tokensJson)
        } catch {}
      }

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApolloClient({}, token))

      // Run wrapped getInitialProps methods
      let pageProps = {}
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx)
      }

      // Only on the server:
      if (typeof window === 'undefined') {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import('@apollo/react-ssr')
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient,
                }}
              />,
            )
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error('Error while running `getDataFromTree`', error)
          }
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract()

      return {
        ...pageProps,
        apolloState,
        token,
        signer,
      }
    }
  }

  return WithApollo
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 */
export function initApolloClient(initialState: NormalizedCacheObject = {}, token?: UserToken) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === 'undefined') {
    return createApolloClient(initialState, token)
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState, token)
  }

  return globalApolloClient
}

/**
 * Creates and configures the ApolloClient
 */
function createApolloClient(initialState: NormalizedCacheObject = {}, token?: UserToken) {
  const headers: { [key: string]: string } = {}
  if (token) {
    headers.Authorization = `Bearer ${token.token}`
    if (typeof sessionStorage !== 'undefined') {
      const roleKey = sessionStorage.getItem('role-key')
      if (roleKey) {
        headers['x-role-key'] = roleKey
      }
    }
  }

  return new ApolloClient({
    credentials: 'include',
    ssrMode: typeof window === 'undefined', // Disables forceFetch on the server (so queries are only run once)
    link: new HttpLink({
      uri: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/graphql`, // Server URL (must be absolute)
      credentials: 'same-origin', // Additional fetch() options like `credentials` or `headers`
      fetch,
      headers,
    }),
    cache: new InMemoryCache({
      dataIdFromObject: (node: any) => {
        switch (node.__typename) {
          case 'User':
            return node.username || node.id
        }
        return node.id
      },
    }).restore(initialState),
  })
}
