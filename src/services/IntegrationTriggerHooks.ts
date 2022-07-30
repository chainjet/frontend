import { DocumentNode, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { IntegrationTrigger, IntegrationTriggerConnection, IntegrationTriggerFilter, IntegrationTriggerSort } from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetIntegrationTriggerById (
  fragment: DocumentNode,
  options: QueryHookOptions<{ integrationTrigger: IntegrationTrigger }, QueryById>
) {
  const query = getEntityQuery({
    entityName: 'integrationTrigger',
    key: 'id',
    fragment,
  })
  return useQuery<{ integrationTrigger: IntegrationTrigger }, QueryById>(query, options)
}

export function useGetIntegrationTriggers (
  fragment: DocumentNode,
  options: QueryHookOptions<{ integrationTriggers: IntegrationTriggerConnection }, QueryMany<IntegrationTriggerFilter, IntegrationTriggerSort>>
) {
  const query = getListEntitiesQuery({
    entityName: 'integrationTrigger',
    pluralEntityName: 'integrationTriggers',
    fragment,
    options,
  })
  return useQuery<{ integrationTriggers: IntegrationTriggerConnection }, QueryMany<IntegrationTriggerFilter, IntegrationTriggerSort>>(query, options)
}
