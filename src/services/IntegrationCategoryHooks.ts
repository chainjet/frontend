import { gql, QueryHookOptions, useQuery } from "@apollo/client"
import { IntegrationCategory } from "../../graphql"

export function useGetIntegrationCategory (options: QueryHookOptions<{}>) {
  const query = gql`
    query IntegrationCategory ($id: String!) {
      integrationCategory (id: $id) {
        id
        name
      }
    }
  `
  return useQuery<{ integrationCategory: IntegrationCategory }>(query, options)
}

export function useGetIntegrationCategories (options: QueryHookOptions<{}>) {
  const query = gql`
    {
      integrationCategories {
        id
        name
      }
    }
  `
  return useQuery<{ integrationCategories: [IntegrationCategory] }>(query, options)
}
