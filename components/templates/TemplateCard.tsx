import { gql } from '@apollo/client'
import { Card } from 'antd'
import Link from 'next/link'
import { Workflow } from '../../graphql'
import { WorkflowIntegrationsGroup } from '../workflows/WorkflowIntegrationsGroup'

interface Props {
  workflow: Workflow
}

export const TemplateCard = ({ workflow }: Props) => {
  return (
    <Link href={`/workflows/${workflow.id}`}>
      <Card className="w-full" hoverable>
        <div className="mb-4">
          <WorkflowIntegrationsGroup workflow={workflow} size={38} />
        </div>
        <div>
          <p className="text-lg font-semibold">{workflow.name}</p>
        </div>
      </Card>
    </Link>
  )
}

TemplateCard.fragments = {
  Workflow: gql`
    fragment TemplateCard_Workflow on Workflow {
      id
      name
      trigger {
        id
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
