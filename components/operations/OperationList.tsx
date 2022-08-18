import { gql } from '@apollo/client'
import { List, Tag, Typography } from 'antd'
import { Integration, IntegrationTrigger } from '../../graphql'
import { IntegrationNode } from '../../src/typings/Integration'
import { IntegrationAvatar } from '../integrations/IntegrationAvatar'

interface Props {
  integration: Integration
  operations: IntegrationNode[]
  columns?: number
}

export function OperationList(props: Props) {
  const { integration, operations, columns } = props

  return (
    <List
      grid={{ gutter: 0, column: columns ?? 1 }}
      dataSource={operations}
      renderItem={(operation) => (
        <List.Item>
          <List.Item.Meta
            avatar={<IntegrationAvatar integration={integration} />}
            title={
              (operation as IntegrationTrigger).instant ? (
                <span className="text-xl">
                  {operation.name}{' '}
                  <Tag color="cyan" style={{ marginLeft: 8 }}>
                    Instant
                  </Tag>
                </span>
              ) : (
                <span className="text-xl">{operation.name}</span>
              )
            }
            description={
              <Typography.Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}>
                {operation.description}
              </Typography.Paragraph>
            }
          />
        </List.Item>
      )}
    />
  )
}

OperationList.fragments = {
  IntegrationTrigger: gql`
    fragment OperationList_IntegrationTrigger on IntegrationTrigger {
      id
      name
      description
      instant
    }
  `,
  IntegrationAction: gql`
    fragment OperationList_IntegrationAction on IntegrationAction {
      id
      name
      description
    }
  `,
}
