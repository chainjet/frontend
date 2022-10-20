import { DocumentNode, FragmentDefinitionNode } from 'graphql'

export const getFragmentNames = (fragment: DocumentNode) =>
  (fragment.definitions.filter((def) => def.kind === 'FragmentDefinition') as FragmentDefinitionNode[]).map(
    (fragmentDefinition) => fragmentDefinition.name.value,
  )

export const getFragmentFirstName = (fragment: DocumentNode) => getFragmentNames(fragment)?.[0]

export async function sendGraphqlQuery(
  endpoint: string,
  query: string,
  headers: Record<string, any> = {},
): Promise<any> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query }),
  })
  return await res.json()
}
