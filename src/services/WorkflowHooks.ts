import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  CreateOneWorkflowInput,
  DeleteOneWorkflowInput,
  TemplateFilter,
  TemplateSort,
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

export function useCompileWorkflow(
  options: QueryHookOptions<
    { compileWorkflow: { bytecode: string; abi: string; sourcecode: string } },
    { workflowId: string }
  >,
) {
  const query = gql`
    query ($workflowId: ID!) {
      compileWorkflow(workflowId: $workflowId) {
        bytecode
        abi
        sourcecode
      }
    }
  `
  return useQuery<{ compileWorkflow: { bytecode: string; abi: string; sourcecode: string } }, { workflowId: string }>(
    query,
    options,
  )
}

export function useForkWorkflow() {
  const mutation = gql`
    mutation forkWorkflow($workflowId: ID!, $templateInputs: JSONObject, $credentialIds: JSONObject) {
      forkWorkflow(workflowId: $workflowId, templateInputs: $templateInputs, credentialIds: $credentialIds) {
        id
      }
    }
  `
  return useMutation(mutation)
}

export function useRecommendedTemplates(
  fragment: DocumentNode,
  options: QueryHookOptions<{ recommendedTemplates: WorkflowConnection }, QueryMany<TemplateFilter, TemplateSort>>,
) {
  const query = getListEntitiesQuery({
    entityName: 'template',
    pluralEntityName: 'recommendedTemplates',
    fragment,
    options,
  })
  return useQuery<{ recommendedTemplates: WorkflowConnection }, QueryMany<TemplateFilter, TemplateSort>>(query, options)
}
