import { DocumentNode, FragmentDefinitionNode } from "graphql"

export const getFragmentNames = (fragment: DocumentNode) =>
  (fragment.definitions
    .filter(def => def.kind === 'FragmentDefinition') as FragmentDefinitionNode[])
    .map(fragmentDefinition => fragmentDefinition.name.value)

export const getFragmentFirstName = (fragment: DocumentNode) => getFragmentNames(fragment)?.[0]
