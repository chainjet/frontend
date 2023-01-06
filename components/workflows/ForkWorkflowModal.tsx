import { gql } from '@apollo/client'
import { Alert, Button, Modal } from 'antd'
import { JSONSchema7 } from 'json-schema'
import { useCallback, useMemo, useState } from 'react'
import { Integration, IntegrationAccount, Workflow } from '../../graphql'
import { useGetAsyncSchemas } from '../../src/services/AsyncSchemaHooks'
import { useGetIntegrationActions } from '../../src/services/IntegrationActionHooks'
import { useGetIntegrationTriggers } from '../../src/services/IntegrationTriggerHooks'
import { useForkWorkflow, useGetWorkflowById } from '../../src/services/WorkflowHooks'
import { isEmptyObj } from '../../src/utils/object.utils'
import { mergePropSchema, replaceInheritFields } from '../../src/utils/schema.utils'
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
      integrationAccount {
        id
      }
    }
  }
`

const getInheritedFieldIds = (schema: JSONSchema7, type: 'integrationTrigger' | 'integrationAction') => {
  const inheritedFieldIds: string[] = []
  const properties = schema?.properties || {}
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'boolean') {
      continue
    }
    const inheritField = (value as any)['x-inheritField']
    if (inheritField?.[type]) {
      inheritedFieldIds.push(inheritField?.[type])
    }
    inheritedFieldIds.push(...getInheritedFieldIds(value, type))
  }
  return inheritedFieldIds
}

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

  const fetchIntegrationTriggers = useMemo(
    () =>
      data?.workflow?.templateSchema ? getInheritedFieldIds(data.workflow.templateSchema, 'integrationTrigger') : [],
    [data],
  )
  const fetchIntegrationActions = useMemo(
    () =>
      data?.workflow?.templateSchema ? getInheritedFieldIds(data.workflow.templateSchema, 'integrationAction') : [],
    [data],
  )
  const { data: integrationTriggers } = useGetIntegrationTriggers(integrationTriggerFragment, {
    skip: !fetchIntegrationTriggers.length,
    variables: {
      filter: {
        id: {
          in: fetchIntegrationTriggers,
        },
      },
    },
  })
  const { data: integrationActions } = useGetIntegrationActions(integrationActionFragment, {
    skip: !fetchIntegrationActions.length,
    variables: {
      filter: {
        id: {
          in: fetchIntegrationActions,
        },
      },
    },
  })

  let templateSchema = useMemo(
    () =>
      data?.workflow?.templateSchema &&
      replaceInheritFields(
        data.workflow.templateSchema,
        integrationTriggers?.integrationTriggers?.edges.map((trigger) => trigger.node) ?? [],
        integrationActions?.integrationActions?.edges.map((action) => action.node) ?? [],
        credentialIds,
      ),
    [data?.workflow, integrationActions, integrationTriggers, credentialIds],
  )

  // support async schemas for templates
  const asyncSchemas: Array<{ name: string; integrationId: string; integrationAction?: string; accountId?: string }> =
    templateSchema?.['x-asyncSchemas']
  const asyncSchemaNames = asyncSchemas?.map((prop: { name: string }) => prop.name) ?? []
  const asyncSchemaRes = useGetAsyncSchemas({
    skip: !asyncSchemaNames.length,
    variables: {
      integrationId: asyncSchemas?.[0].integrationId ?? '',
      accountCredentialId: asyncSchemas?.[0].accountId ?? '',
      names: asyncSchemaNames,
      integrationActionId: asyncSchemas?.[0]?.integrationAction ?? '',
      inputs: {},
    },
  })
  templateSchema = useMemo(() => {
    if (!isEmptyObj(asyncSchemaRes?.data?.asyncSchemas.schemas ?? {})) {
      return mergePropSchema(templateSchema, asyncSchemaRes?.data?.asyncSchemas.schemas!)
    }
    return templateSchema
  }, [asyncSchemaRes?.data?.asyncSchemas.schemas, templateSchema])

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

  const handleTemplateInputsChange = useCallback(
    (inputs: Record<string, any>) => {
      setTemplateInputs({
        ...templateInputs,
        ...inputs,
      })
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
    const trigger = data.workflow.trigger
    if (trigger?.integrationTrigger?.integration?.integrationAccount?.id && !trigger.integrationTrigger.skipAuth) {
      integrations.push({
        integration: trigger.integrationTrigger.integration,
        account: trigger.integrationTrigger.integration.integrationAccount,
      })
    }
    const actions = data.workflow.actions?.edges.map((edge) => edge.node) ?? []
    for (const action of actions) {
      if (action.integrationAction?.integration?.integrationAccount?.id && !action.integrationAction.skipAuth) {
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
      title={templateSchema ? `Use template "${workflow.name}"` : `Create a copy of "${workflow.name}"`}
      open={visible}
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
      {(loading || forkLoading) && <Loading />}
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
      {templateSchema && (
        <SchemaForm
          schema={templateSchema}
          initialInputs={templateInputs ?? {}}
          hideSubmit
          onChange={handleTemplateInputsChange}
          onSubmit={() => {}}
        />
      )}
      {!forkLoading && (
        <>
          <Button type="primary" key="deploy" onClick={() => handleFork()} loading={forkLoading}>
            {workflow.isTemplate ? 'Use Template' : 'Fork'}
          </Button>
        </>
      )}
    </Modal>
  )
}
