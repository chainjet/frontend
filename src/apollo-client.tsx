import { ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'
import { useMemo } from 'react'

const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apiApolloClient: ApolloClient<NormalizedCacheObject>

function createApolloClient() {
  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/graphql`,
  })

  const retryLink = new RetryLink({
    delay: {
      initial: 500,
      max: Infinity,
      jitter: true,
    },
    attempts: {
      max: 3,
      retryIf: (error, _operation) => !!error,
    },
  })

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
      )

    if (networkError) console.error(`[Network error]: ${networkError}`)
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: retryLink.concat(errorLink).concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {},
        },
      },
    }),
  })
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apiApolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) => sourceArray.every((s) => !isEqual(d, s))),
      ],
    })

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apiApolloClient) apiApolloClient = _apolloClient

  return _apolloClient
}

export function addApolloState(client: any, pageProps: any) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(pageProps: any) {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(() => initializeApollo(state), [state])
  return store
}
