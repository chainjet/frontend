import React, { useState } from 'react'
import { useGetIntegrations } from '../../../../src/services/IntegrationHooks'
import { gql } from '@apollo/client'
import { Button, Card, Col, Input, List, message, Row, Typography } from 'antd'
import { SelectCredentials } from './SelectCredentials'
import { Integration, IntegrationCategory, IntegrationConnection, IntegrationSortFields, SortDirection } from '../../../../graphql'
import { IntegrationAvatar } from '../../../integrations/IntegrationAvatar'
import { IntegrationFilters } from '../../../integrations/IntegrationFilters'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import Link from 'next/link'

interface Props {
  nodeType?: 'trigger' | 'action'
  initialCategory?: IntegrationCategory
  onIntegrationSelect?: (integration: Integration) => any
  onCategoryChange?: (category: IntegrationCategory | null) => any
  useIntegrationLink?: (integration: Integration) => string
  useCategoryLink?: (category: IntegrationCategory | null) => string
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

export const SelectIntegration = (props: Props) => {
  const { nodeType, initialCategory, onIntegrationSelect, onCategoryChange, useIntegrationLink, useCategoryLink } = props
  const [search, setSearch] = useState('')
  const [categorySelected, setCategorySelected] = useState<IntegrationCategory | null>(initialCategory ?? null)
  const [loadingMore, setLoadingMore] = useState(false)
  const breakpoint = useBreakpoint()
  const hideCategories = breakpoint.xs

  const queryVars = {
    filter: {
      deprecated: {
        is: false
      },
      ...(
        nodeType 
          ? {
              [nodeType === 'trigger' ? 'numberOfTriggers' : 'numberOfActions']: {
                gt: 0
              }
            }
          : {}
      ),
      ...(
        categorySelected?.id
          ? { integrationCategories: { eq: categorySelected.id } }
          : {}
      ),
    },
    search,
    paging: {
      first: 120
    },
    ...(
      search
        ? {}
        : { sorting: [{ field: IntegrationSortFields.name, direction: SortDirection.ASC }] }
    )
  }
  const { data, loading, error, fetchMore } = useGetIntegrations(selectIntegrationFragment, {
    variables: queryVars
  })

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleCategoryChange = async (category: IntegrationCategory | null) => {
    setCategorySelected(category)
    onCategoryChange?.(category)
    if (!useCategoryLink) {
      document.querySelector('.ant-drawer-body')?.scrollTo({ top: 0 })
      window.scrollTo({ top: 0 })
    }
  }

  const handleLoadMoreClick = async () => {
    if (data?.integrations?.pageInfo.endCursor) {
      setLoadingMore(true)
      await fetchMore({
        variables: {
          ...queryVars,
          paging: {
            ...queryVars.paging,
            after: data?.integrations?.pageInfo.endCursor
          }
        },
        updateQuery: (previousResult: { integrations: IntegrationConnection }, { fetchMoreResult }) => {
          const newEdges = fetchMoreResult?.integrations.edges
          const pageInfo = fetchMoreResult?.integrations.pageInfo
          return pageInfo && newEdges?.length
            ? {
              integrations: {
                  ...previousResult.integrations,
                  edges: [...previousResult.integrations.edges, ...newEdges],
                  pageInfo
                }
              }
            : previousResult
        }
      })
      setLoadingMore(false)
    }
  }

  if (error) {
    return <>Unexpected error, please try again.</>
  }

  const integrations = data?.integrations?.edges?.map(edge => edge.node) || []
  const hasNextPage = !!data?.integrations?.pageInfo?.hasNextPage

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Input.Search placeholder="Find integration" onChange={handleSearchChange} enterButton/>
      </div>

      <Row>
        {
          !hideCategories && (
            <Col span={4}>
              <Typography.Title level={5}>Category</Typography.Title>
              <IntegrationFilters onCategoryChange={handleCategoryChange}
                                  categorySelected={categorySelected}
                                  useCategoryLink={useCategoryLink}/>
            </Col>
          )
        }
        
        <Col span={hideCategories ? 24: 20} style={{ padding: '0px 24px' }}>
          {
            search && categorySelected && !integrations.length && (
              <div style={{ marginBottom: 16 }}>
                No results for "<strong>{search}</strong>" in <strong>{categorySelected.name}</strong>.
                <Button type="link" onClick={() => setCategorySelected(null)}>Search all categories</Button>
              </div>
            )
          }

          <List
            dataSource={integrations}
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
            renderItem={integration => {
              const integrationContent = (
                <List.Item onClick={() => onIntegrationSelect?.(integration)}>
                  <Card hoverable={!!onIntegrationSelect || !!useIntegrationLink} bordered={false}>
                    <Card.Meta
                      avatar={<IntegrationAvatar integration={integration}/>}
                      title={integration.name}
                      description=""
                    />
                  </Card>
                </List.Item>
              )
              if (useIntegrationLink) {
                return (
                  <Link href={useIntegrationLink(integration)}>
                    <a>{integrationContent}</a>
                  </Link>
                )
              }
              return integrationContent
            }}
            loadMore={
              hasNextPage && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <Button loading={loadingMore} onClick={handleLoadMoreClick}>Load More</Button>
                </div>
              )
            }
          />
        </Col>
      </Row>
    </>
  )
}
