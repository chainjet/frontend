import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { Table } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Workflow } from '../../graphql'
import { WorkflowIntegrationsGroup } from './WorkflowIntegrationsGroup'

interface Props {
  workflows: Workflow[]
}

export const WorkflowsTable = ({ workflows }: Props) => {
  const router = useRouter()

  const onRowClick = (workflow: Workflow) => {
    router.push(`/workflows/${workflow.id}`)
  }

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, workflow: Workflow) => (
        <Link href={`/workflows/${workflow.id}`}>
          <a className="font-medium text-black">{name}</a>
        </Link>
      ),
    },
    {
      title: <span className="hidden md:block">Integrations</span>,
      dataIndex: 'integrations',
      key: 'integrations',
      render: (_: any, workflow: Workflow) => (
        <div className="hidden md:block">
          <WorkflowIntegrationsGroup workflow={workflow} />
        </div>
      ),
    },
    {
      title: 'Is Active?',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (_: any, workflow: Workflow) => (
        <>
          {workflow.isTemplate ? (
            '-'
          ) : workflow.trigger?.enabled && workflow.actions?.edges.length ? (
            <span className="text-green-600">
              <CheckOutlined />
            </span>
          ) : (
            <span className="text-red-600">
              <CloseOutlined />
            </span>
          )}
        </>
      ),
    },
  ]

  return (
    <Table
      dataSource={workflows}
      columns={tableColumns}
      pagination={{ pageSize: 120 }}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
      })}
      rowClassName="cursor-pointer"
    />
  )
}

WorkflowsTable.fragments = {
  Workflow: gql`
    fragment WorkflowsTable_Workflow on Workflow {
      id
      name
      isTemplate
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
