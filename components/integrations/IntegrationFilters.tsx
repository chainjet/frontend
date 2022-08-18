import { Menu } from 'antd'
import Link from 'next/link'
import { integrationCategories, IntegrationCategory } from '../../src/constants/integration-categories'

interface Props {
  categorySelected: IntegrationCategory | null
  onCategoryChange: (categoryId: string | null) => void
  getCategoryLink?: (category: IntegrationCategory | null) => string
}

export function IntegrationFilters(props: Props) {
  const { categorySelected, onCategoryChange, getCategoryLink } = props

  const handleItemSelect = (key: string) => {
    onCategoryChange(key ?? null)
  }

  return (
    <>
      <Menu
        selectedKeys={[categorySelected ? categorySelected.id : 'all']}
        onSelect={(info) => handleItemSelect(info.key.toString())}
      >
        <Menu.Item key="popular">
          {getCategoryLink ? (
            <Link href={getCategoryLink(integrationCategories[0])}>
              <a>Popular</a>
            </Link>
          ) : (
            'Popular'
          )}
        </Menu.Item>
        <Menu.Item key="all">
          {getCategoryLink ? (
            <Link href={getCategoryLink(null)}>
              <a>A-Z</a>
            </Link>
          ) : (
            'A-Z'
          )}
        </Menu.Item>
        {integrationCategories.slice(1).map((category) => (
          <Menu.Item key={category.id}>
            {getCategoryLink ? (
              <Link href={getCategoryLink(category)}>
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
