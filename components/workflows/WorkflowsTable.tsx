import React from 'react'
import { Table } from 'antd'
import Link from 'next/link'
import { gql } from '@apollo/client'
import { Project, Workflow } from '../../graphql'

interface Props {
  project: Project
  workflows: Workflow[]
}

export const WorkflowsTable = (props: Props) => {
  const { workflows } = props

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, workflow: Workflow) => (
        <Link href="/[username]/[project]/workflow/[workflow]" as={`/${workflow.slug}`}>
          <a>{name}</a>
        </Link>
      ),
    },
  ]

  return <Table dataSource={workflows} columns={tableColumns} />
}

WorkflowsTable.fragments = {
  Project: gql`
    fragment WorkflowsTable_Project on Project {
      id
    }
  `,
  Workflow: gql`
    fragment WorkflowsTable_Workflow on Workflow {
      id
      name
      slug
    }
  `,
}
