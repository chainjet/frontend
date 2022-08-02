import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  CreateOneProjectInput,
  DeleteOneInput,
  Project,
  ProjectConnection,
  ProjectFilter,
  ProjectSort,
  UpdateOneProjectInput,
} from '../../graphql'
import { QueryMany } from '../typings/GraphQL'
import { getListEntitiesQuery } from './GraphQLHooks'

export function useGetProjects(
  fragment: DocumentNode,
  options: QueryHookOptions<{ projects: ProjectConnection }, QueryMany<ProjectFilter, ProjectSort>> = {},
) {
  const query = getListEntitiesQuery({
    entityName: 'project',
    pluralEntityName: 'projects',
    fragment,
    options,
  })
  return useQuery<{ projects: ProjectConnection }, QueryMany<ProjectFilter, ProjectSort>>(query, options)
}

export function useCreateOneProject() {
  const mutation = gql`
    mutation ($input: CreateOneProjectInput!) {
      createOneProject(input: $input) {
        id
        slug
      }
    }
  `
  return useMutation<{ createOneProject: Project }, { input: CreateOneProjectInput }>(mutation)
}

export function useUpdateOneProject() {
  const mutation = gql`
    mutation ($input: UpdateOneProjectInput!) {
      updateOneProject(input: $input) {
        id
        slug
        name
      }
    }
  `
  return useMutation<{ updateOneProject: Project }, { input: UpdateOneProjectInput }>(mutation)
}

export function useDeleteOneProject() {
  const mutation = gql`
    mutation ($input: DeleteOneInput!) {
      deleteOneProject(input: $input) {
        id
      }
    }
  `
  return useMutation<{ deleteOneProject: Project }, { input: DeleteOneInput }>(mutation, {
    update: (cache, { data }) => {
      if (data?.deleteOneProject.id) {
        cache.evict({
          id: data.deleteOneProject.id,
        })
      }
    },
  })
}
