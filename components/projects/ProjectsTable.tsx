import React from 'react'
import Link from 'next/link'
import { Table } from 'antd'
import { gql } from '@apollo/client'
import { Project } from '../../graphql'

interface Props {
  projects: Project[]
}

export const ProjectsTable = (props: Props) => {
  const { projects } = props

  const dataSource = projects.map((project) => ({
    key: project.id,
    name: project.name,
    slug: project.slug,
  }))

  return (
    <Table
      dataSource={dataSource}
      columns={[
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (name, project) => (
            <Link href="/[username]/[project]" as={`/${project.slug}`}>
              <a>{name}</a>
            </Link>
          ),
        },
      ]}
      pagination={false}
    />
  )
}

ProjectsTable.fragments = {
  Project: gql`
    fragment ProjectsTableFragment on Project {
      id
      slug
      name
    }
  `,
}
