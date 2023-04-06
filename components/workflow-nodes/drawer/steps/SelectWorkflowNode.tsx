import { ArrowLeftOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Input, List, Tag, Typography } from 'antd'
import { useState } from 'react'
import { IntegrationAction, IntegrationTrigger, OperationCategory } from '../../../../graphql'
import { capitalize } from '../../../../src/utils/strings'

interface Props<T extends IntegrationTrigger | IntegrationAction> {
  nodeType: 'trigger' | 'action'
  nodes: T[]
  operationCategories: OperationCategory[]
  categorySelected: string | undefined
  onFilterChange: (search: string) => void
  onNodeSelected: (node: T) => void
  onCategorySelected: (category: OperationCategory | null) => void
  loading: boolean
}

export function SelectWorkflowNode<T extends IntegrationTrigger | IntegrationAction>(props: Props<T>) {
  const {
    nodeType,
    nodes,
    operationCategories,
    categorySelected,
    onNodeSelected,
    onFilterChange,
    onCategorySelected,
    loading,
  } = props
  const [search, setSearch] = useState('')
  const nodeTypeWithArticle = nodeType === 'trigger' ? 'a trigger' : 'an action'

  const handleFilterChange = (filter: string) => {
    onFilterChange(filter)
    setSearch(filter)
  }

  const renderCategoryList = () => {
    return (
      <>
        <Typography.Title level={4} style={{ marginTop: '24px' }}>
          ... Or explore by category
        </Typography.Title>
        <List
          itemLayout="horizontal"
          size="small"
          bordered
          loading={loading}
          dataSource={operationCategories}
          renderItem={(category) => (
            <List.Item
              onClick={() => onCategorySelected(category)}
              className="cursor-pointer hover:bg-blue-50 hover:shadow-sm"
            >
              <List.Item.Meta
                title={capitalize(category.name)}
                description={
                  <Typography.Paragraph ellipsis={{ rows: 2 }} type="secondary">
                    {category.description}
                  </Typography.Paragraph>
                }
              />
            </List.Item>
          )}
        />
      </>
    )
  }

  const renderNodeList = () => {
    let title
    if (categorySelected) {
      title = (
        <>
          <ArrowLeftOutlined onClick={() => onCategorySelected(null)} style={{ marginRight: '8px' }} />
          {capitalize(nodeType)}s in the category "{categorySelected}"
        </>
      )
    } else {
      title = ''
    }

    return (
      <>
        <Typography.Title level={4} style={{ marginTop: '24px' }}>
          {title}
        </Typography.Title>
        <List
          itemLayout="horizontal"
          size="small"
          bordered
          loading={loading}
          dataSource={nodes}
          renderItem={(node) => (
            <List.Item onClick={() => onNodeSelected(node)} className="cursor-pointer hover:bg-blue-50 hover:shadow-sm">
              <List.Item.Meta
                title={
                  (node as IntegrationTrigger).instant ? (
                    <>
                      {capitalize(node.name)}{' '}
                      <Tag color="cyan" style={{ marginLeft: 8 }}>
                        Instant
                      </Tag>
                    </>
                  ) : nodeType === 'action' ? (
                    <>
                      {capitalize(node.name)}{' '}
                      {/* <Tag color="gold" style={{ marginLeft: 8 }}>
                        {(node as IntegrationAction).type === OperationType.OffChain ? 'Off-Chain' : 'On-Chain'}
                      </Tag> */}
                    </>
                  ) : (
                    capitalize(node.name)
                  )
                }
                description={
                  <Typography.Paragraph ellipsis={{ rows: 2 }} type="secondary">
                    {node.description}
                  </Typography.Paragraph>
                }
              />
            </List.Item>
          )}
        />
      </>
    )
  }

  return (
    <>
      <Typography.Title level={4}>
        {operationCategories.length ? `Find ${nodeTypeWithArticle} by name` : ''}
      </Typography.Title>

      <Input.Search
        placeholder={`Type the ${nodeType}'s name`}
        onChange={(e) => handleFilterChange(e.target.value)}
        enterButton
      />

      {!search && !categorySelected && operationCategories.length > 1 ? renderCategoryList() : renderNodeList()}
    </>
  )
}

SelectWorkflowNode.fragments = {
  IntegrationAction: gql`
    fragment SelectWorkflowNode_IntegrationAction on IntegrationAction {
      id
      name
      description
      skipAuth
      type
    }
  `,
  IntegrationTrigger: gql`
    fragment SelectWorkflowNode_IntegrationTrigger on IntegrationTrigger {
      id
      key
      name
      description
      skipAuth
      instant
    }
  `,
}
