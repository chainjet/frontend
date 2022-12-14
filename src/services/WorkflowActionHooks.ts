import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  CreateOneWorkflowActionInput,
  DeleteOneWorkflowActionInput,
  UpdateOneWorkflowActionInput,
  WorkflowAction,
  WorkflowActionConnection,
  WorkflowActionFilter,
  WorkflowActionSort,
} from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetWorkflowActionById(
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflowAction: WorkflowAction }, QueryById>,
) {
  const query = getEntityQuery({
    entityName: 'workflowAction',
    key: 'id',
    fragment,
  })
  return useQuery<{ workflowAction: WorkflowAction }, QueryById>(query, options)
}

export function useGetWorkflowsActions(
  fragment: DocumentNode,
  options: QueryHookOptions<
    { workflowActions: WorkflowActionConnection },
    QueryMany<WorkflowActionFilter, WorkflowActionSort>
  >,
) {
  const query = getListEntitiesQuery({
    entityName: 'workflowAction',
    pluralEntityName: 'workflowActions',
    fragment,
    options,
  })
  return useQuery<{ workflowActions: WorkflowActionConnection }, QueryMany<WorkflowActionFilter, WorkflowActionSort>>(
    query,
    options,
  )
}

export function useCreateOneWorkflowAction() {
  const mutation = gql`
    mutation ($input: CreateOneWorkflowActionInput!) {
      createOneWorkflowAction(input: $input) {
        id
      }
    }
  `
  return useMutation<{ createOneWorkflowAction: WorkflowAction }, { input: CreateOneWorkflowActionInput }>(mutation)
}

export function useUpdateOneWorkflowAction() {
  // return updated fields in order to update apollo cache
  const mutation = gql`
    mutation ($input: UpdateOneWorkflowActionInput!) {
      updateOneWorkflowAction(input: $input) {
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

export function useDeleteOneWorkflowAction() {
  const mutation = gql`
    mutation ($input: DeleteOneWorkflowActionInput!) {
      deleteOneWorkflowAction(input: $input) {
        id
      }
    }
  `
  return useMutation<{ deleteOneWorkflowAction: WorkflowAction }, { input: DeleteOneWorkflowActionInput }>(mutation, {
    update: (cache, { data }) => {
      if (data?.deleteOneWorkflowAction.id) {
        cache.evict({
          id: data.deleteOneWorkflowAction.id,
        })
      }
    },
  })
}

export function useTestWorkflowAction() {
  const mutation = gql`
    mutation ($id: String!) {
      testWorkflowAction(id: $id) {
        id
      }
    }
  `
  return useMutation<{ testWorkflowAction: WorkflowAction }, { id: string }>(mutation)
}
