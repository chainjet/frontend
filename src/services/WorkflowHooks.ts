import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  CreateOneWorkflowInput,
  DeleteOneInput,
  UpdateOneWorkflowInput,
  Workflow,
  WorkflowConnection,
  WorkflowFilter,
  WorkflowSort,
} from '../../graphql'
import { QueryMany } from '../typings/GraphQL'
import { getListEntitiesQuery } from './GraphQLHooks'

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
        slug
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
        slug
        name
        runOnFailure
      }
    }
  `
  return useMutation<{ updateOneWorkflow: Workflow }, { input: UpdateOneWorkflowInput }>(mutation)
}

export function useDeleteOneWorkflow() {
  const mutation = gql`
    mutation ($input: DeleteOneInput!) {
      deleteOneWorkflow(input: $input) {
        id
      }
    }
  `
  return useMutation<{ deleteOneWorkflow: Workflow }, { input: DeleteOneInput }>(mutation, {
    update: (cache, { data }) => {
      if (data?.deleteOneWorkflow.id) {
        cache.evict({
          id: data.deleteOneWorkflow.id,
        })
      }
    },
  })
}
