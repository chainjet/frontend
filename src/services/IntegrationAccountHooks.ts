import { DocumentNode, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  IntegrationAccount,
  IntegrationAccountConnection,
  IntegrationAccountFilter,
  IntegrationAccountSort,
} from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetIntegrationAccountById(
  fragment: DocumentNode,
  options: QueryHookOptions<{ integrationAccount: IntegrationAccount }, QueryById>,
) {
  const query = getEntityQuery({
    entityName: 'integrationAccount',
    key: 'id',
    fragment,
  })
  return useQuery<{ integrationAccount: IntegrationAccount }, QueryById>(query, options)
}

export function useGetIntegrationAccounts(
  fragment: DocumentNode,
  options: QueryHookOptions<
    { integrationAccounts: IntegrationAccountConnection },
    QueryMany<IntegrationAccountFilter, IntegrationAccountSort>
  >,
) {
  const query = getListEntitiesQuery({
    entityName: 'integrationAccount',
    pluralEntityName: 'integrationAccounts',
    fragment,
    options,
  })
  return useQuery<
    { integrationAccounts: IntegrationAccountConnection },
    QueryMany<IntegrationAccountFilter, IntegrationAccountSort>
  >(query, options)
}
