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

const GET_MANY_ASYNC_SCHEMAS = gql`
  query ManyAsyncSchemas($asyncSchemaInputs: [JSONObject!]!) {
    manyAsyncSchemas(asyncSchemaInputs: $asyncSchemaInputs) {
      schemas
      schemaExtension
    }
  }
`

type QueryRequestAsyncSchemas = {
  integrationId: string
  accountCredentialId: string
  names: string[]
  inputs?: Record<string, any>
  integrationTriggerId?: string
  integrationActionId?: string
}

type QueryResponseAsyncSchemas = {
  asyncSchemas: {
    schemas: { [key: string]: JSONSchema7 }
    schemaExtension: JSONSchema7
  }
}

export function useGetAsyncSchemas(options: QueryHookOptions<QueryResponseAsyncSchemas, QueryRequestAsyncSchemas>) {
  return useQuery<QueryResponseAsyncSchemas, QueryRequestAsyncSchemas>(GET_ASYNC_SCHEMAS, options)
}

type QueryRequestManyAsyncSchemas = {
  asyncSchemaInputs: QueryRequestAsyncSchemas[]
}

type QueryResponseManyAsyncSchemas = {
  manyAsyncSchemas: {
    schemas: { [key: string]: JSONSchema7 }
    schemaExtension: JSONSchema7
  }
}

export function useGetManyAsyncSchemas(
  options: QueryHookOptions<QueryResponseManyAsyncSchemas, QueryRequestManyAsyncSchemas>,
) {
  return useQuery<QueryResponseManyAsyncSchemas, QueryRequestManyAsyncSchemas>(GET_MANY_ASYNC_SCHEMAS, options)
}
