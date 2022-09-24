import { gql } from '@apollo/client'
import { Table } from 'antd'
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
  ]

  return <Table dataSource={workflows} columns={tableColumns} />
}

WorkflowsTable.fragments = {
  Workflow: gql`
    fragment WorkflowsTable_Workflow on Workflow {
      id
      name
    }
  `,
}
