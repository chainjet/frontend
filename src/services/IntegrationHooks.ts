import { DocumentNode, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { Integration, IntegrationConnection, IntegrationFilter, IntegrationSort } from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetIntegrationIntegrationById(
  fragment: DocumentNode,
  options: QueryHookOptions<{ integration: Integration }, QueryById>,
) {
  const query = getEntityQuery({
    entityName: 'integration',
    key: 'id',
    fragment,
  })
  return useQuery<{ integration: Integration }, QueryById>(query, options)
}

export function useGetIntegrations(
  fragment: DocumentNode,
  options: QueryHookOptions<{ integrations: IntegrationConnection }, QueryMany<IntegrationFilter, IntegrationSort>>,
) {
  const query = getListEntitiesQuery({
    entityName: 'integration',
    pluralEntityName: 'integrations',
    fragment,
    options,
  })
  return useQuery<{ integrations: IntegrationConnection }, QueryMany<IntegrationFilter, IntegrationSort>>(
    query,
    options,
  )
}
