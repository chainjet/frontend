import { DocumentNode, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  IntegrationAction,
  IntegrationActionConnection,
  IntegrationActionFilter,
  IntegrationActionSort,
} from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetIntegrationActionById(
  fragment: DocumentNode,
  options: QueryHookOptions<{ integrationAction: IntegrationAction }, QueryById>,
) {
  const query = getEntityQuery({
    entityName: 'integrationAction',
    key: 'id',
    fragment,
  })
  return useQuery<{ integrationAction: IntegrationAction }, QueryById>(query, options)
}

export function useGetIntegrationActions(
  fragment: DocumentNode,
  options: QueryHookOptions<
    { integrationActions: IntegrationActionConnection },
    QueryMany<IntegrationActionFilter, IntegrationActionSort>
  >,
) {
  const query = getListEntitiesQuery({
    entityName: 'integrationAction',
    pluralEntityName: 'integrationActions',
    fragment,
    options,
  })
  return useQuery<
    { integrationActions: IntegrationActionConnection },
    QueryMany<IntegrationActionFilter, IntegrationActionSort>
  >(query, options)
}
