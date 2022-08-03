import React from 'react'
import { gql } from '@apollo/client'
import { ProjectsTable } from './ProjectsTable'
import { useGetProjects } from '../../src/services/ProjectHooks'
import { Loading } from '../common/RequestStates/Loading'
import { RequestError } from '../common/RequestStates/RequestError'

const projectsFragment = gql`
  fragment UserProjectsFragment on Project {
    ...ProjectsTableFragment
  }
  ${ProjectsTable.fragments.Project}
`

export const UserProjects = () => {
  const { data, loading, error } = useGetProjects(projectsFragment)

  if (loading) {
    return <Loading />
  }
  if (error || !data?.projects) {
    return <RequestError error={error} />
  }

  const projects = data.projects.edges.map((edge) => edge.node)

  return <ProjectsTable projects={projects} />
}
