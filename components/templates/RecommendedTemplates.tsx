import { gql } from '@apollo/client'
import { useEffect } from 'react'
import { Workflow } from '../../graphql'
import { useRecommendedTemplates } from '../../src/services/WorkflowHooks'
import { Loading } from '../common/RequestStates/Loading'
import { TemplateCard } from './TemplateCard'

const workflowsFragment = gql`
  fragment UserWorkflowsFragment on Workflow {
    ...TemplateCard_Workflow
  }
  ${TemplateCard.fragments.Workflow}
`

interface Props {
  integrationKey?: string
  onTemplatesLoaded?: (templates: Workflow[]) => void
}

export const RecommendedTemplates = ({ integrationKey, onTemplatesLoaded }: Props) => {
  const { data, loading, error } = useRecommendedTemplates(workflowsFragment, {
    variables: {
      filter: {
        ...(integrationKey ? { integrationKey: { eq: integrationKey } } : {}),
      },
      paging: {
        first: 12,
      },
    },
  })
  const recommendedTemplates = data?.recommendedTemplates?.edges.map((edge) => edge.node)

  useEffect(() => {
    if (data && Array.isArray(recommendedTemplates)) {
      onTemplatesLoaded?.(recommendedTemplates)
    }
  }, [onTemplatesLoaded, data, recommendedTemplates])

  if (!recommendedTemplates) {
    return <Loading />
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recommendedTemplates.map((template) => (
        <TemplateCard key={template.id} workflow={template} />
      ))}
    </div>
  )
}
