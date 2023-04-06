import { useState } from 'react'
import {
  Integration,
  IntegrationAction,
  IntegrationActionFilter,
  IntegrationActionSort,
  IntegrationActionSortFields,
  OperationCategory,
  SortDirection,
} from '../../../../graphql'
import { useGetIntegrationActions } from '../../../../src/services/IntegrationActionHooks'
import { QueryMany } from '../../../../src/typings/GraphQL'
import { RequestError } from '../../../common/RequestStates/RequestError'
import { SelectWorkflowNode } from './SelectWorkflowNode'

interface Props {
  integration: Integration
  onOperationSelected: (operation: IntegrationAction) => any
}

export const SelectWorkflowAction = ({ integration, onOperationSelected }: Props) => {
  const [categorySelected, setCategorySelected] = useState<string | undefined>()
  const [search, setSearch] = useState('')

  const queryVars: QueryMany<IntegrationActionFilter, IntegrationActionSort> = {
    filter: {
      integration: {
        eq: integration.id,
      },
      unlisted: {
        isNot: true,
      },
      ...(search ? { name: { iLike: search } } : {}),
    },
    sorting: [{ field: IntegrationActionSortFields.name, direction: SortDirection.ASC }],
    paging: {
      first: 120,
    },
  }
  const { data, loading, error, refetch } = useGetIntegrationActions(SelectWorkflowNode.fragments.IntegrationAction, {
    variables: queryVars,
  })

  const onFilterChange = async (search: string) => {
    setSearch(search)
  }

  const onCategorySelected = async (category: OperationCategory | null) => {
    setCategorySelected(category?.name)
    await refetch({
      ...queryVars,
      filter: {
        ...queryVars.filter,
        ...(category?.key ? { category: { eq: category.key } } : {}),
      },
    })
  }

  if (error) {
    return <RequestError error={error} />
  }

  const operationCategories = (integration.operationCategories || []).filter((category) => category.numberOfActions)
  let actions = data?.integrationActions.edges?.map((edge) => edge.node) || []

  // Sort actions by name
  if (!search) {
    actions = actions.sort((a, b) => {
      if (a.name > b.name) {
        return 1
      }
      return -1
    })
  }

  return (
    <SelectWorkflowNode
      nodeType="action"
      nodes={actions}
      operationCategories={operationCategories}
      categorySelected={categorySelected}
      onFilterChange={onFilterChange}
      onNodeSelected={onOperationSelected}
      onCategorySelected={onCategorySelected}
      loading={loading}
    />
  )
}
