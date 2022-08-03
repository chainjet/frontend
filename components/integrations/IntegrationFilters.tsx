import { Menu } from 'antd'
import Link from 'next/link'
import React from 'react'
import { IntegrationCategory } from '../../graphql'
import { useGetIntegrationCategories } from '../../src/services/IntegrationCategoryHooks'
import { Loading } from '../common/RequestStates/Loading'

interface Props {
  categorySelected: IntegrationCategory | null
  onCategoryChange: (category: IntegrationCategory | null) => void
  useCategoryLink?: (category: IntegrationCategory | null) => string
}

export function IntegrationFilters(props: Props) {
  const { categorySelected, onCategoryChange, useCategoryLink } = props
  const { data, loading, error } = useGetIntegrationCategories({})

  if (loading) {
    return <Loading />
  }
  if (error || !data?.integrationCategories.length) {
    return <></> // Don't need to show an error
  }

  const handleItemSelect = (key: string) => {
    const category = data.integrationCategories.find((category) => category.id === key)
    onCategoryChange(category ?? null)
  }

  return (
    <>
      <Menu
        selectedKeys={[categorySelected ? categorySelected.id : 'all']}
        onSelect={(info) => handleItemSelect(info.key.toString())}
      >
        <Menu.Item key="all">
          {useCategoryLink ? (
            <Link href={useCategoryLink(null)}>
              <a>All</a>
            </Link>
          ) : (
            'All'
          )}
        </Menu.Item>
        {data.integrationCategories.map((category) => (
          <Menu.Item key={category.id}>
            {useCategoryLink ? (
              <Link href={useCategoryLink(category)}>
                <a>{category.name}</a>
              </Link>
            ) : (
              category.name
            )}
          </Menu.Item>
        ))}
      </Menu>
    </>
  )
}
