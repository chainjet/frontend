import { gql } from '@apollo/client'
import { Button, Card, Col, Input, List, Row, Select, Typography } from 'antd'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { Integration, IntegrationConnection, IntegrationSortFields, SortDirection } from '../../../../graphql'
import { integrationCategories, IntegrationCategory } from '../../../../src/constants/integration-categories'
import { useGetIntegrations } from '../../../../src/services/IntegrationHooks'
import { IntegrationAvatar } from '../../../integrations/IntegrationAvatar'
import { IntegrationFilters } from '../../../integrations/IntegrationFilters'
import { SelectCredentials } from './credentials/SelectCredentials'

interface Props {
  nodeType?: 'trigger' | 'action'
  initialCategory?: IntegrationCategory
  onIntegrationSelect?: (integration: Integration) => any
  onCategoryChange?: (category: IntegrationCategory | null) => any
  getIntegrationLink?: (integration: Integration) => string
  getCategoryLink?: (category: IntegrationCategory | null) => string
  hidePopular?: boolean
}

const selectIntegrationFragment = gql`
  fragment SelectIntegrationFragment on Integration {
    id
    key
    name
    logo
    operationCategories {
      key
      name
      description
      numberOfTriggers
      numberOfActions
    }
    integrationAccount {
      ...SelectCredentials_IntegrationAccount
    }
  }
  ${SelectCredentials.fragments.IntegrationAccount}
`

interface Folder {
  isFolder: true
  name: string
  logo: string
  key: string
}

const folders: Folder[] = [
  {
    isFolder: true,
    logo: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/aws.svg',
    name: 'Amazon Web Services',
    key: 'aws',
  },
]

export const SelectIntegration = ({
  nodeType,
  initialCategory,
  onIntegrationSelect,
  onCategoryChange,
  getIntegrationLink,
  getCategoryLink,
  hidePopular,
}: Props) => {
  const [search, setSearch] = useState('')
  const [categorySelected, setCategorySelected] = useState<IntegrationCategory | null>(initialCategory ?? null)
  const [folderSelected, setFolderSelected] = useState<Folder | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const breakpoint = useBreakpoint()
  const smallCategoriesSelector = breakpoint.xs

  const displayAll = !search && !categorySelected?.id

  const queryVars = {
    filter: {
      ...(nodeType
        ? {
            [nodeType === 'trigger' ? 'numberOfTriggers' : 'numberOfActions']: {
              gt: 0,
            },
          }
        : {}),
      ...(!search && categorySelected?.id ? { integrationCategories: { eq: categorySelected.id } } : {}),
      ...(displayAll && folderSelected
        ? { parentKey: { eq: folderSelected.key } }
        : search
        ? {}
        : { parentKey: { neq: 'aws' } }),
      ...(search ? { name: { iLike: search } } : {}),
      deprecated: { is: false },
    },
    paging: {
      first: 120,
    },
    ...(search ? {} : { sorting: [{ field: IntegrationSortFields.name, direction: SortDirection.ASC }] }),
  }
  const { data, loading, error, fetchMore } = useGetIntegrations(selectIntegrationFragment, {
    variables: queryVars,
  })

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleCategoryChange = (categoryId: string | null) => {
    const category = integrationCategories.find((c) => c.id === categoryId) ?? null
    setCategorySelected(category)
    onCategoryChange?.(category)
    if (!getCategoryLink) {
      document.querySelector('.ant-drawer-body')?.scrollTo({ top: 0 })
      window.scrollTo({ top: 0 })
    }
    setFolderSelected(null)
  }

  const handleFolderSelect = (folder: Folder) => {
    setFolderSelected(folder)
  }

  const handleLoadMoreClick = async () => {
    if (data?.integrations?.pageInfo.endCursor) {
      setLoadingMore(true)
      await fetchMore({
        variables: {
          ...queryVars,
          paging: {
            ...queryVars.paging,
            after: data?.integrations?.pageInfo.endCursor,
          },
        },
        updateQuery: (previousResult: { integrations: IntegrationConnection }, { fetchMoreResult }) => {
          const newEdges = fetchMoreResult?.integrations.edges
          const pageInfo = fetchMoreResult?.integrations.pageInfo
          return pageInfo && newEdges?.length
            ? {
                integrations: {
                  ...previousResult.integrations,
                  edges: [...previousResult.integrations.edges, ...newEdges],
                  pageInfo,
                },
              }
            : previousResult
        },
      })
      setLoadingMore(false)
    }
  }

  const integrations = data?.integrations?.edges?.map((edge) => edge.node)
  const hasNextPage = !!data?.integrations?.pageInfo?.hasNextPage

  const integrationsAndFolders = useMemo(
    () =>
      !loading && displayAll && !folderSelected
        ? [...(integrations ?? []), ...folders].sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
        : integrations,
    [displayAll, folderSelected, integrations, loading],
  )

  if (error) {
    return <>Unexpected error, please try again.</>
  }

  return (
    <>
      {smallCategoriesSelector && (
        <div className="flex items-center w-full gap-2 mb-8">
          <div>
            <strong>Category:</strong>
          </div>
          <Select className="w-full" defaultValue={categorySelected?.id} onChange={handleCategoryChange}>
            {!hidePopular && (
              <Select.Option value={integrationCategories[0].id} key="popular">
                Popular
              </Select.Option>
            )}
            <Select.Option value="all" key="all">
              A-Z
            </Select.Option>
            {integrationCategories.slice(1).map((category) => (
              <Select.Option value={category.id} key={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      <div className="mb-8">
        <Input.Search placeholder="Find integration" onChange={handleSearchChange} enterButton />
      </div>

      <Row>
        {!smallCategoriesSelector && (
          <Col span={4}>
            <Typography.Title level={5}>Category</Typography.Title>
            <IntegrationFilters
              onCategoryChange={handleCategoryChange}
              categorySelected={categorySelected}
              getCategoryLink={getCategoryLink}
              hidePopular={hidePopular}
            />
          </Col>
        )}

        <Col span={smallCategoriesSelector ? 24 : 20} style={{ padding: '0px 24px' }}>
          <List
            dataSource={integrationsAndFolders}
            loading={loading}
            bordered={false}
            itemLayout="horizontal"
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            renderItem={(integration) => {
              if ('isFolder' in integration) {
                return (
                  <List.Item onClick={() => handleFolderSelect?.(integration)}>
                    <Card hoverable={!!onIntegrationSelect || !!getIntegrationLink} bordered={false}>
                      <Card.Meta
                        avatar={<IntegrationAvatar integration={integration} />}
                        title={integration.name}
                        description=""
                      />
                    </Card>
                  </List.Item>
                )
              }
              const integrationContent = (
                <List.Item onClick={() => onIntegrationSelect?.(integration)}>
                  <Card hoverable={!!onIntegrationSelect || !!getIntegrationLink} bordered={false}>
                    <Card.Meta
                      avatar={<IntegrationAvatar integration={integration} />}
                      title={integration.name}
                      description=""
                    />
                  </Card>
                </List.Item>
              )
              if (getIntegrationLink) {
                return (
                  <Link href={getIntegrationLink(integration)}>
                    <a>{integrationContent}</a>
                  </Link>
                )
              }
              return integrationContent
            }}
            loadMore={
              hasNextPage && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Button loading={loadingMore} onClick={handleLoadMoreClick}>
                    Load More
                  </Button>
                </div>
              )
            }
          />
        </Col>
      </Row>
    </>
  )
}
