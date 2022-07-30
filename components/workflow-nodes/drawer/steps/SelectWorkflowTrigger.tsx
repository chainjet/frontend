import React, { useState } from 'react'
import { SelectWorkflowNode } from './SelectWorkflowNode'
import { RequestError } from '../../../common/RequestStates/RequestError'
import { useGetIntegrationTriggers } from '../../../../src/services/IntegrationTriggerHooks'
import { Integration, IntegrationTrigger, IntegrationTriggerSortFields, OperationCategory, SortDirection } from '../../../../graphql'

interface Props {
  integration: Integration
  onTriggerSelected: (trigger: IntegrationTrigger) => any
}

export const SelectWorkflowTrigger = (props: Props) => {
  const { integration, onTriggerSelected } = props
  const [categorySelected, setCategorySelected] = useState<string | undefined>()
  const [search, setSearch] = useState('')

  const queryVars = {
    filter: {
      integration: {
        eq: integration.id
      },
      deprecated: {
        is: false
      }
    },
    sorting: [{ field: IntegrationTriggerSortFields.name, direction: SortDirection.ASC }],
    search,
    paging: {
      first: 120,
    },
  }
  const { data, loading, error, refetch } = useGetIntegrationTriggers(SelectWorkflowNode.fragments.IntegrationTrigger, {
    variables: queryVars
  })

  const onFilterChange = async (search: string) => {
    setSearch(search)
    // await refetch({
    //   ...queryVars,
    //   sorting: [],
    //   search,
    // })
  }

  const onCategorySelected = async (category: OperationCategory | null) => {
    setCategorySelected(category?.name)
    await refetch({
      ...queryVars,
      filter: {
        ...queryVars.filter,
        ...(category?.key ? { category: { eq: category.key } } : {}),
      }
    })
  }

  if (error) {
    return <RequestError error={error}/>
  }

  const operationCategories = (integration.operationCategories || []).filter(category => category.numberOfTriggers)
  let triggers = (data?.integrationTriggers.edges?.map(edge => edge.node) || [])

  // Sort instant triggers first, then by name
  if (!search) {
    triggers = triggers.sort((a, b) => {
      if (a.instant && b.instant) {
        if (a.name > b.name) {
          return 1
        }
        return -1
      }
      if (a.instant) {
        return -1
      }
      if (b.instant) {
        return 1
      }
      if (a.name > b.name) {
        return 1
      }
      return -1
    })
  }

  return (
    <SelectWorkflowNode nodeType="trigger"
                        nodes={triggers}
                        operationCategories={operationCategories}
                        categorySelected={categorySelected}
                        onFilterChange={onFilterChange}
                        onNodeSelected={onTriggerSelected}
                        onCategorySelected={onCategorySelected}
                        loading={loading}/>
  )
}
