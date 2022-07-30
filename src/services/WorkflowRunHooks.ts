import { QueryHookOptions, useQuery } from "@apollo/client"
import { DocumentNode } from "graphql"
import { WorkflowRun, WorkflowRunConnection, WorkflowRunFilter, WorkflowRunSort } from "../../graphql"
import { QueryById, QueryMany } from "../typings/GraphQL"
import { getEntityQuery, getListEntitiesQuery } from "./GraphQLHooks"

export function useGetWorkflowRunById (
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflowRun: WorkflowRun }, QueryById>
) {
  const query = getEntityQuery({
    entityName: 'workflowRun',
    key: 'id',
    fragment,
  })
  return useQuery<{ workflowRun: WorkflowRun }, QueryById>(query, options)
}

export function useGetWorkflowRuns (
  fragment: DocumentNode,
  options: QueryHookOptions<{ workflowRuns: WorkflowRunConnection }, QueryMany<WorkflowRunFilter, WorkflowRunSort>>
) {
  const query = getListEntitiesQuery({
    entityName: 'workflowRun',
    pluralEntityName: 'workflowRuns',
    fragment,
    options,
  })
  return useQuery<{ workflowRuns: WorkflowRunConnection }, QueryMany<WorkflowRunFilter, WorkflowRunSort>>(query, options)
}
