import { gql } from '@apollo/client'
import { Avatar, Table, Tooltip } from 'antd'
import Link from 'next/link'
import { Workflow } from '../../graphql'

interface Props {
  workflows: Workflow[]
}

export const WorkflowsTable = ({ workflows }: Props) => {
  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, workflow: Workflow) => (
        <Link href={`/workflows/${workflow.id}`}>
          <a>{name}</a>
        </Link>
      ),
    },
    {
      title: <span className="hidden md:block">Integrations</span>,
      dataIndex: 'integrations',
      key: 'integrations',
      render: (_: any, workflow: Workflow) => {
        const integrations = []
        if (workflow.trigger) {
          integrations.push(workflow.trigger.integrationTrigger.integration)
        }
        for (const action of workflow.actions?.edges ?? []) {
          if (!integrations.some((integration) => integration.id === action.node.integrationAction.integration.id)) {
            integrations.push(action.node.integrationAction.integration)
          }
        }
        return (
          <div className="hidden md:block">
            <Avatar.Group maxCount={5}>
              {integrations.map((integration) => (
                <Tooltip key={integration.id} title={integration.name}>
                  <Avatar src={integration.logo} style={{ width: 28, height: 28 }} />
                </Tooltip>
              ))}
            </Avatar.Group>
          </div>
        )
      },
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (_: any, workflow: Workflow) => <>{workflow.trigger?.enabled ? 'Yes' : 'No'}</>,
    },
  ]

  return <Table dataSource={workflows} columns={tableColumns} pagination={{ pageSize: 120 }} />
}

WorkflowsTable.fragments = {
  Workflow: gql`
    fragment WorkflowsTable_Workflow on Workflow {
      id
      name
      trigger {
        id
        enabled
        integrationTrigger {
          id
          integration {
            id
            name
            logo
          }
        }
      }
      actions {
        edges {
          node {
            id
            integrationAction {
              id
              integration {
                id
                name
                logo
              }
            }
          }
        }
      }
    }
  `,
}
