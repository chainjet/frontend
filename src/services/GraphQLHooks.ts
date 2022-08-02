import { DocumentNode, gql as graphqlTag } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { getFragmentFirstName } from '../utils/graphql.utils'
import { capitalize } from '../utils/strings'

export function getEntityQuery({
  entityName,
  key = 'id',
  fragment,
}: {
  entityName: string
  key: string
  fragment: DocumentNode
}) {
  const fragmentName = getFragmentFirstName(fragment)
  if (!fragmentName) {
    throw new Error('At least one fragment must be provided')
  }
  return graphqlTag`
    query ($${key}: ID!) {
      ${entityName} (${key}: $${key}) {
        ${'...' + fragmentName}
      }
    }
    ${fragment}
  `
}

export function getListEntitiesQuery({
  entityName,
  pluralEntityName,
  fragment,
  options,
}: {
  entityName: string
  pluralEntityName: string
  fragment: DocumentNode
  options: QueryHookOptions
}) {
  const fragmentName = getFragmentFirstName(fragment)
  if (!fragmentName) {
    throw new Error('At least one fragment must be provided')
  }
  const filterType = capitalize(entityName) + 'Filter'
  const sortType = `[${capitalize(entityName)}Sort!]`
  const sorting = typeof options?.variables?.sorting !== 'undefined'
  const search = typeof options?.variables?.search !== 'undefined'
  const paging = typeof options?.variables?.paging !== 'undefined'
  return graphqlTag`
    query ($filter: ${filterType} ${sorting ? ', $sorting: ' + sortType : ''} ${search ? ', $search: String' : ''} ${
    paging ? ', $paging: CursorPaging' : ''
  }) {
      ${pluralEntityName} (filter: $filter ${sorting ? ', sorting: $sorting' : ''} ${
    search ? ', search: $search' : ''
  } ${paging ? ', paging: $paging' : ''}) {
        edges {
          node {
            ${'...' + fragmentName}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    ${fragment}
  `
}
