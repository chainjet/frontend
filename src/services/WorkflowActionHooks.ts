import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'
import {
  CreateOneWorkflowActionInput,
  DeleteOneInput,
  UpdateOneWorkflowActionInput,
  WorkflowAction,
  WorkflowActionConnection,
  WorkflowActionFilter,
  WorkflowActionSort
} from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'

export function useGetWorkflowActionById (
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflowAction: WorkflowAction }, QueryById>
) {
  const query = getEntityQuery({
    entityName: 'workflowAction',
    key: 'id',
    fragment,
  })
  return useQuery<{ workflowAction: WorkflowAction }, QueryById>(query, options)
}

export function useGetWorkflowsActions (
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflowActions: WorkflowActionConnection }, QueryMany<WorkflowActionFilter, WorkflowActionSort>>
) {
  const query = getListEntitiesQuery({
    entityName: 'workflowAction',
    pluralEntityName: 'workflowActions',
    fragment,
    options,
  })
  return useQuery<{ workflowActions: WorkflowActionConnection }, QueryMany<WorkflowActionFilter, WorkflowActionSort>>(query, options)
}

export function useCreateOneWorkflowAction () {
  const mutation = gql`
    mutation ($input: CreateOneWorkflowActionInput!) {
      createOneWorkflowAction (input: $input) {
        id
      }
    }
  `
  return useMutation<{ createOneWorkflowAction: WorkflowAction }, { input: CreateOneWorkflowActionInput }>(mutation)
}

export function useUpdateOneWorkflowAction () {
  // return updated fields in order to update apollo cache
  const mutation = gql`
    mutation ($input: UpdateOneWorkflowActionInput!) {
      updateOneWorkflowAction (input: $input) {
        id
        inputs
        credentials {
          id
        }
      }
    }
  `
  return useMutation<{ updateOneWorkflowAction: WorkflowAction }, { input: UpdateOneWorkflowActionInput }>(mutation)
}

export function useDeleteOneWorkflowAction () {
  const mutation = gql`
    mutation ($input: DeleteOneInput!) {
      deleteOneWorkflowAction (input: $input) {
        id
      }
    }
  `
  return useMutation<{ deleteOneWorkflowAction: WorkflowAction }, { input: DeleteOneInput }>(mutation, {
    update: (cache, { data }) => {
      if (data?.deleteOneWorkflowAction.id) {
        cache.evict({
          id: data.deleteOneWorkflowAction.id,
        })
      }
    }
  })
}
