import { gql } from '@apollo/client'
import { Alert, Button, Modal } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { Integration, IntegrationAccount, SendPromptPayload } from '../../graphql'
import { useCreateWorkflowPrompt } from '../../src/services/AiHooks'
import { useGetIntegrationActions } from '../../src/services/IntegrationActionHooks'
import { useGetIntegrationTriggerById } from '../../src/services/IntegrationTriggerHooks'
import { Loading } from '../common/RequestStates/Loading'
import { SelectCredentials } from '../workflow-nodes/drawer/steps/credentials/SelectCredentials'

interface Props {
  promptData: SendPromptPayload
  visible: boolean
  onCreateWorkflow: (workflowId: string) => any
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
        skipAuth
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
            skipAuth
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

const integrationTriggerFragment = gql`
  fragment ForkWorkflowModal_IntegrationTrigger on IntegrationTrigger {
    id
    schemaRequest
    integration {
      id
      logo
      integrationAccount {
        id
      }
    }
  }
`

const integrationActionFragment = gql`
  fragment ForkWorkflowModal_IntegrationAction on IntegrationAction {
    id
    schemaRequest
    integration {
      id
      logo
      integrationAccount {
        id
      }
    }
  }
`

export const CreateWorkflowModal = ({ promptData, visible, onCreateWorkflow: onWorkflowFork, onClose }: Props) => {
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<Error | null>(null)
  const [createWorkflowPrompt] = useCreateWorkflowPrompt()
  const [templateInputs, setTemplateInputs] = useState<Record<string, any>>()
  const [credentialIds, setCredentialIds] = useState<Record<string, string>>({})

  const { data: integrationTriggerData } = useGetIntegrationTriggerById(integrationTriggerFragment, {
    variables: {
      id: promptData.trigger.id,
    },
  })
  const integrationTrigger = integrationTriggerData?.integrationTrigger

  const { data: integrationActionsData } = useGetIntegrationActions(integrationActionFragment, {
    skip: !promptData.actions.length,
    variables: {
      filter: {
        id: {
          in: promptData.actions.map((item) => item.id),
        },
      },
    },
  })
  const integrationActions = useMemo(
    () => integrationActionsData?.integrationActions?.edges.map((item) => item.node) || [],
    [integrationActionsData?.integrationActions?.edges],
  )

  const handleCreateWorkflow = async () => {
    // check if all required credentials are selected
    const noConnectedAccounts = integrationsWithAccounts.filter((item) => !credentialIds[item.account.id])
    if (noConnectedAccounts.length) {
      setCreateError(new Error(`Please connect ${noConnectedAccounts.map((item) => item.account.name).join(' and ')}.`))
      return
    }

    setCreateError(null)
    setCreateLoading(true)
    try {
      const res = await createWorkflowPrompt({ variables: { id: promptData.id, credentialIds } })
      const data = res.data?.createWorkflowPrompt
      if (!data?.id) {
        throw new Error('Unexpected error, please try again')
      }
      onWorkflowFork(data.id)
    } catch (e) {
      setCreateError(e as Error)
    }
    setCreateLoading(false)
  }

  const handleTemplateInputsChange = useCallback(
    (inputs: Record<string, any>) => {
      setTemplateInputs({
        ...templateInputs,
        ...inputs,
      })
      setCreateError(null)
    },
    [templateInputs],
  )

  const handleCredentialSelect = useCallback(
    (account: IntegrationAccount, id: string) => {
      if (credentialIds[account.id] !== id) {
        setCredentialIds({
          ...credentialIds,
          [account.id]: id,
        })
        setCreateError(null)
      }
    },
    [credentialIds],
  )

  // list of unique integrations that require accounts
  const integrationsWithAccounts = useMemo(() => {
    if (!integrationTrigger) {
      return []
    }
    let integrations: { integration: Integration; account: IntegrationAccount }[] = []
    if (integrationTrigger?.integration?.integrationAccount?.id && !integrationTrigger.skipAuth) {
      integrations.push({
        integration: integrationTrigger.integration,
        account: integrationTrigger.integration.integrationAccount,
      })
    }
    for (const integrationAction of integrationActions) {
      if (integrationAction?.integration?.integrationAccount?.id && !integrationAction.skipAuth) {
        if (!integrations.some((a) => a.integration.id === integrationAction.integration.id)) {
          integrations.push({
            integration: integrationAction.integration,
            account: integrationAction.integration.integrationAccount,
          })
        }
      }
    }
    return integrations
  }, [integrationActions, integrationTrigger])

  const isLoading = createLoading

  return (
    <Modal
      title={`Create Workflow`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      {createError && (
        <Alert
          style={{ marginBottom: 16 }}
          message="Error"
          description={createError?.message}
          type="error"
          showIcon
          closable
          onClose={() => setCreateError(null)}
        />
      )}
      {createLoading && <Loading />}
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
      {/* {!templateSchemaEmpty && (
        <SchemaForm
          schema={templateSchema}
          initialInputs={templateInputs ?? {}}
          onChange={handleTemplateInputsChange}
          onSubmit={handleFork}
          loading={createLoading}
          submitButtonText={workflow.isTemplate ? 'Use Template' : 'Fork'}
        />
      )} */}
      {!isLoading && (
        <Button type="primary" key="deploy" onClick={() => handleCreateWorkflow()} loading={createLoading}>
          Create Workflow
        </Button>
      )}
    </Modal>
  )
}
