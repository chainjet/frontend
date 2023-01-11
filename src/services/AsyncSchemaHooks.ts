import { gql, QueryHookOptions, useQuery } from '@apollo/client'
import { JSONSchema7 } from 'json-schema'

const GET_ASYNC_SCHEMAS = gql`
  query AsyncSchemas(
    $integrationId: String!
    $accountCredentialId: String!
    $names: [String!]!
    $inputs: JSONObject
    $integrationTriggerId: String
    $integrationActionId: String
  ) {
    asyncSchemas(
      integrationId: $integrationId
      accountCredentialId: $accountCredentialId
      names: $names
      inputs: $inputs
      integrationTriggerId: $integrationTriggerId
      integrationActionId: $integrationActionId
    ) {
      schemas
      schemaExtension
    }
  }
`

type QueryRequest = {
  integrationId: string
  accountCredentialId: string
  names: string[]
  inputs?: Record<string, any>
  integrationTriggerId?: string
  integrationActionId?: string
}

type QueryResponse = {
  asyncSchemas: {
    schemas: { [key: string]: JSONSchema7 }
    schemaExtension: JSONSchema7
  }
}

export function useGetAsyncSchemas(options: QueryHookOptions<QueryResponse, QueryRequest>) {
  return useQuery<QueryResponse, QueryRequest>(GET_ASYNC_SCHEMAS, options)
}
