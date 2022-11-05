import { gql } from '@apollo/client'
import { Alert, Button, Modal } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { Integration, IntegrationAccount, Workflow } from '../../graphql'
import { useForkWorkflow, useGetWorkflowById } from '../../src/services/WorkflowHooks'
import { SchemaForm } from '../common/Forms/schema-form/SchemaForm'
import { Loading } from '../common/RequestStates/Loading'
import { SelectCredentials } from '../workflow-nodes/drawer/steps/credentials/SelectCredentials'

interface Props {
  workflow: Workflow
  visible: boolean
  onWorkflowFork: (forkId: string) => any
  onClose: () => any
}

const workflowFragment = gql`
  fragment ForkWorkflowModal on Workflow {
    id
    templateSchema
    trigger {
      id
      inputs
      integrationTrigger {
        id
        integration {
          id
          name
          logo
          integrationAccount {
            ...SelectCredentials_IntegrationAccount
          }
        }
      }
    }
    actions {
      edges {
        node {
          id
          inputs
          integrationAction {
            id
            integration {
              id
              name
              logo
              integrationAccount {
                ...SelectCredentials_IntegrationAccount
              }
            }
          }
        }
      }
    }
  }
  ${SelectCredentials.fragments.IntegrationAccount}
`

export const ForkWorkflowModal = ({ workflow, visible, onWorkflowFork, onClose }: Props) => {
  const [forkLoading, setForkLoading] = useState(false)
  const [forkError, setForkError] = useState<Error | null>(null)
  const { data, loading, error, refetch } = useGetWorkflowById(workflowFragment, {
    variables: {
      id: workflow.id,
    },
  })
  const [templateInputs, setTemplateInputs] = useState<Record<string, any>>()
  const [forkWorkflow] = useForkWorkflow()
  const [credentialIds, setCredentialIds] = useState<Record<string, string>>({})

  const handleFork = async () => {
    setForkLoading(true)
    try {
      const res = await forkWorkflow({
        variables: {
          workflowId: workflow.id,
          templateInputs,
          credentialIds,
        },
      })
      const forkId = res?.data?.forkWorkflow?.id
      if (forkId) {
        onWorkflowFork(forkId)
      } else {
        setForkError(new Error('Failed to fork workflow'))
      }
    } catch (e) {
      setForkError(e as Error)
    }
    setForkLoading(false)
  }

  const handleTemplateInputsChange = useCallback((inputs: Record<string, any>) => {
    setTemplateInputs(inputs)
  }, [])

  const handleCredentialSelect = useCallback(
    (account: IntegrationAccount, id: string) => {
      if (credentialIds[account.id] !== id) {
        setCredentialIds({
          ...credentialIds,
          [account.id]: id,
        })
      }
    },
    [credentialIds],
  )

  // list of unique integrations that require accounts
  const integrationsWithAccounts = useMemo(() => {
    if (!data?.workflow) {
      return []
    }
    let integrations: { integration: Integration; account: IntegrationAccount }[] = []
    if (data.workflow.trigger?.integrationTrigger?.integration?.integrationAccount) {
      integrations.push({
        integration: data.workflow.trigger.integrationTrigger.integration,
        account: data.workflow.trigger.integrationTrigger.integration.integrationAccount,
      })
    }
    const actions = data.workflow.actions?.edges.map((edge) => edge.node) ?? []
    for (const action of actions) {
      if (action.integrationAction?.integration?.integrationAccount?.id) {
        if (!integrations.some((a) => a.integration.id === action.integrationAction.integration.id)) {
          integrations.push({
            integration: action.integrationAction.integration,
            account: action.integrationAction.integration.integrationAccount,
          })
        }
      }
    }
    return integrations
  }, [data?.workflow])

  return (
    <Modal
      title={`Create a copy of "${workflow.name}"`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      {forkError && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Error"
          description={forkError.message}
          type="error"
          showIcon
          closable
          onClose={() => setForkError(null)}
        />
      )}
      {forkLoading && <Loading />}
      {integrationsWithAccounts.map((item, i) => (
        <div className="mb-8 border-l-4 border-indigo-500" key={i}>
          <div className="flex flex-row gap-2 mb-2 ">
            {item.integration.logo && (
              <img src={item.integration.logo} width={24} height={24} alt={item.integration.name} />
            )}
            <strong>{item.integration.name} Account</strong>
          </div>
          <SelectCredentials
            integrationAccount={item.account}
            onCredentialsSelected={(id) => handleCredentialSelect(item.account, id)}
            hideNameInput
            hideSubmitButton
          />
        </div>
      ))}
      {data?.workflow?.templateSchema && (
        <SchemaForm
          schema={data.workflow.templateSchema}
          initialInputs={{}}
          hideSubmit
          onChange={handleTemplateInputsChange}
          onSubmit={handleFork}
        />
      )}
      {!forkLoading && (
        <>
          <Button type="primary" key="deploy" onClick={() => handleFork()} loading={forkLoading}>
            Fork
          </Button>
        </>
      )}
    </Modal>
  )
}
