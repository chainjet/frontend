import { gql } from '@apollo/client'
import { ProjectSortFields, SortDirection } from '../../graphql'
import { useGetProjects } from '../../src/services/ProjectHooks'
import { Loading } from '../common/RequestStates/Loading'
import { RequestError } from '../common/RequestStates/RequestError'
import { ProjectsTable } from './ProjectsTable'

const projectsFragment = gql`
  fragment UserProjectsFragment on Project {
    ...ProjectsTableFragment
  }
  ${ProjectsTable.fragments.Project}
`

export const UserProjects = () => {
  const { data, loading, error } = useGetProjects(projectsFragment, {
    variables: {
      paging: {
        first: 120,
      },
      sorting: [
        {
          field: ProjectSortFields.createdAt,
          direction: SortDirection.DESC,
        },
      ],
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error || !data?.projects) {
    return <RequestError error={error} />
  }

  const projects = data.projects.edges.map((edge) => edge.node)

  return <ProjectsTable projects={projects} />
}
