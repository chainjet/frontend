import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  CreateOneWorkflowInput,
  DeleteOneWorkflowInput,
  UpdateOneWorkflowInput,
  Workflow,
  WorkflowConnection,
  WorkflowFilter,
  WorkflowSort,
} from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetWorkflowById(
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflow: Workflow }, QueryById>,
) {
  const query = getEntityQuery({
    entityName: 'workflow',
    key: 'id',
    fragment,
  })
  return useQuery<{ workflow: Workflow }, QueryById>(query, options)
}

export function useGetWorkflows(
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflows: WorkflowConnection }, QueryMany<WorkflowFilter, WorkflowSort>>,
) {
  const query = getListEntitiesQuery({
    entityName: 'workflow',
    pluralEntityName: 'workflows',
    fragment,
    options,
  })
  return useQuery<{ workflows: WorkflowConnection }, QueryMany<WorkflowFilter, WorkflowSort>>(query, options)
}

export function useCreateOneWorkflow() {
  const mutation = gql`
    mutation ($input: CreateOneWorkflowInput!) {
      createOneWorkflow(input: $input) {
        id
      }
    }
  `
  return useMutation<{ createOneWorkflow: Workflow }, { input: CreateOneWorkflowInput }>(mutation)
}

export function useUpdateOneWorkflow() {
  const mutation = gql`
    mutation ($input: UpdateOneWorkflowInput!) {
      updateOneWorkflow(input: $input) {
        id
        name
        runOnFailure
      }
    }
  `
  return useMutation<{ updateOneWorkflow: Workflow }, { input: UpdateOneWorkflowInput }>(mutation)
}

export function useDeleteOneWorkflow() {
  const mutation = gql`
    mutation ($input: DeleteOneWorkflowInput!) {
      deleteOneWorkflow(input: $input) {
        id
      }
    }
  `
  return useMutation<{ deleteOneWorkflow: Workflow }, { input: DeleteOneWorkflowInput }>(mutation, {
    update: (cache, { data }) => {
      if (data?.deleteOneWorkflow.id) {
        cache.evict({
          id: data.deleteOneWorkflow.id,
        })
      }
    },
  })
}
