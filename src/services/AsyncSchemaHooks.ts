import { gql, QueryHookOptions, useQuery } from '@apollo/client'
import { JSONSchema7 } from 'json-schema'

const GET_ASYNC_SCHEMAS = gql`
  query AsyncSchemas($integrationId: String!, $accountCredentialId: String!, $names: [String!]!) {
    asyncSchemas(integrationId: $integrationId, accountCredentialId: $accountCredentialId, names: $names) {
      schemas
    }
  }
`

type QueryRequest = {
  integrationId: string
  accountCredentialId: string
  names: string[]
}

type QueryResponse = {
  asyncSchemas: {
    schemas: { [key: string]: JSONSchema7 }
  }
}

export function useGetAsyncSchemas(options: QueryHookOptions<QueryResponse, QueryRequest>) {
  return useQuery<QueryResponse, QueryRequest>(GET_ASYNC_SCHEMAS, options)
}
