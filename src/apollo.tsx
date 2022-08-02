import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/react-hooks'
import fetch from 'isomorphic-unfetch'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import PageLayout from '../components/common/PageLayout/PageLayout'
import ViewerContextProvider from '../components/providers/ViewerContextProvider'
import { User } from '../graphql'
import { AuthService, TOKEN_COOKIE_NAME, USER_COOKIE_NAME } from './services/AuthService'
import { UserTokens } from './typings/UserTokens'

let globalApolloClient: ApolloClient<NormalizedCacheObject> | null = null

export function refreshApolloClient() {
  globalApolloClient = null
}

type ApolloPageContext = NextPageContext & { apolloClient: ApolloClient<NormalizedCacheObject> }

interface WithApolloProps {
  apolloClient?: ApolloClient<NormalizedCacheObject>
  apolloState?: NormalizedCacheObject
  tokens?: UserTokens
  viewer?: User | null
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 */
export function withApollo(PageComponent: any, { useLayout = true, ssr = true } = {}) {
  const WithApollo = ({ apolloClient, apolloState, tokens, viewer, ...pageProps }: WithApolloProps) => {
    const client = apolloClient || initApolloClient(apolloState, tokens)
    const pageComponent = <PageComponent {...pageProps} />
    return (
      <ViewerContextProvider viewer={viewer}>
        <ApolloProvider client={client}>
          {viewer && useLayout ? <PageLayout>{pageComponent}</PageLayout> : pageComponent}
        </ApolloProvider>
      </ViewerContextProvider>
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
      const viewer = new AuthService(ctx).getViewer()

      const tokensJson = parseCookies(ctx || null)[TOKEN_COOKIE_NAME]
      let tokens: UserTokens | undefined
      if (tokensJson) {
        try {
          tokens = JSON.parse(tokensJson)
        } catch {}
        if (
          tokens &&
          tokens.refreshToken &&
          (!tokens.accessTokenExpiration || tokens.accessTokenExpiration < new Date().getTime())
        ) {
          if (viewer) {
            await refreshCredentials(ctx, viewer.username, tokens)
            tokens = JSON.parse(tokensJson)
          }
        }
      }

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApolloClient({}, tokens))

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

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind()
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract()

      return {
        ...pageProps,
        apolloState,
        tokens,
        viewer,
      }
    }
  }

  return WithApollo
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 */
export function initApolloClient(initialState: NormalizedCacheObject = {}, tokens?: UserTokens) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (typeof window === 'undefined') {
    return createApolloClient(initialState, tokens)
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(initialState, tokens)
  }

  return globalApolloClient
}

/**
 * Creates and configures the ApolloClient
 */
function createApolloClient(initialState: NormalizedCacheObject = {}, tokens?: UserTokens) {
  const headers: { [key: string]: string } = {}
  if (tokens) {
    headers.Authorization = `Bearer ${tokens.accessToken}`
  }

  return new ApolloClient({
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

async function refreshCredentials(ctx: ApolloPageContext, username: string, tokens: UserTokens) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/auth/token`, {
    // TODO
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      refreshToken: tokens.refreshToken,
    }),
  })

  if (res.status >= 200 && res.status < 300) {
    setCookie(
      ctx,
      TOKEN_COOKIE_NAME,
      JSON.stringify({
        ...tokens,
        ...(await res.json()),
        __typename: undefined,
      }),
      {},
    )
  } else if (res.status === 401) {
    // invalid refresh token, remove all cookies
    destroyCookie(ctx, USER_COOKIE_NAME)
    destroyCookie(ctx, TOKEN_COOKIE_NAME)
    refreshApolloClient()
  }
}
