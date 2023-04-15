import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  CreateOneWorkflowTriggerInput,
  DeleteOneWorkflowTriggerInput,
  UpdateOneWorkflowTriggerInput,
  WorkflowTrigger,
  WorkflowTriggerConnection,
  WorkflowTriggerFilter,
  WorkflowTriggerSort,
} from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetWorkflowTriggerById(
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflowTrigger: WorkflowTrigger }, QueryById>,
) {
  const query = getEntityQuery({
    entityName: 'workflowTrigger',
    key: 'id',
    fragment,
  })
  return useQuery<{ workflowTrigger: WorkflowTrigger }, QueryById>(query, options)
}

export function useGetWorkflowsTriggers(
  fragment: DocumentNode,
  options: QueryHookOptions<
    { workflowTriggers: WorkflowTriggerConnection },
    QueryMany<WorkflowTriggerFilter, WorkflowTriggerSort>
  >,
) {
  const query = getListEntitiesQuery({
    entityName: 'workflowTrigger',
    pluralEntityName: 'workflowTriggers',
    fragment,
    options,
  })
  return useQuery<
    { workflowTriggers: WorkflowTriggerConnection },
    QueryMany<WorkflowTriggerFilter, WorkflowTriggerSort>
  >(query, options)
}

export function useCreateOneWorkflowTrigger() {
  const mutation = gql`
    mutation ($input: CreateOneWorkflowTriggerInput!) {
      createOneWorkflowTrigger(input: $input) {
        id
        hookId
      }
    }
  `
  return useMutation<{ createOneWorkflowTrigger: WorkflowTrigger }, { input: CreateOneWorkflowTriggerInput }>(mutation)
}

export function useUpdateOneWorkflowTrigger() {
  // return updated fields in order to update apollo cache
  const mutation = gql`
    mutation ($input: UpdateOneWorkflowTriggerInput!) {
      updateOneWorkflowTrigger(input: $input) {
        id
        inputs
        credentials {
          id
        }
        schedule
        enabled
        maxConsecutiveFailures
      }
    }
  `
  return useMutation<{ updateOneWorkflowTrigger: WorkflowTrigger }, { input: UpdateOneWorkflowTriggerInput }>(mutation)
}

export function useDeleteOneWorkflowTrigger() {
  const mutation = gql`
    mutation ($input: DeleteOneWorkflowTriggerInput!) {
      deleteOneWorkflowTrigger(input: $input) {
        id
      }
    }
  `
  return useMutation<{ deleteOneWorkflowTrigger: WorkflowTrigger }, { input: DeleteOneWorkflowTriggerInput }>(
    mutation,
    {
      update: (cache, { data }) => {
        if (data?.deleteOneWorkflowTrigger.id) {
          cache.evict({
            id: data.deleteOneWorkflowTrigger.id,
          })
        }
      },
    },
  )
}

export function useCheckWorkflowTrigger() {
  const mutation = gql`
    mutation ($id: String!) {
      checkWorkflowTrigger(id: $id) {
        id
      }
    }
  `
  return useMutation<{ checkWorkflowTrigger: WorkflowTrigger }, { id: string }>(mutation)
}

export function useTestWorkflowTrigger() {
  const mutation = gql`
    mutation ($id: String!) {
      testWorkflowTrigger(id: $id) {
        id
      }
    }
  `
  return useMutation<{ testWorkflowTrigger: WorkflowTrigger }, { id: string }>(mutation)
}

export function useRunWorkflowTriggerLastEvent() {
  const mutation = gql`
    mutation ($id: String!) {
      runWorkflowTriggerLastEvent(id: $id) {
        id
      }
    }
  `
  return useMutation<{ testWorkflowTrigger: WorkflowTrigger }, { id: string }>(mutation)
}

export function useRunWorkflowTriggerHistory() {
  const mutation = gql`
    mutation ($id: String!) {
      runWorkflowTriggerHistory(id: $id) {
        id
      }
    }
  `
  return useMutation<{ runWorkflowTriggerHistory: WorkflowTrigger }, { id: string }>(mutation)
}
