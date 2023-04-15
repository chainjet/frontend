import { gql } from '@apollo/client'
import { Alert, Card } from 'antd'
import deepmerge from 'deepmerge'
import { JSONSchema7 } from 'json-schema'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { OperationsUsed } from '../../../components/users/OperationsUsed'
import { ActionInputsForm } from '../../../components/workflow-nodes/drawer/steps/ActionInputsForm'
import { SelectCredentials } from '../../../components/workflow-nodes/drawer/steps/credentials/SelectCredentials'
import { IntegrationAccount } from '../../../graphql'
import { withApollo } from '../../../src/apollo'
import { bulkActions, bulkDataSources } from '../../../src/constants/bulk-action-items'
import { useGetIntegrationActions } from '../../../src/services/IntegrationActionHooks'
import { useGetIntegrations } from '../../../src/services/IntegrationHooks'
import { useGetIntegrationTriggers } from '../../../src/services/IntegrationTriggerHooks'
import { useRedirectGuests, useViewer } from '../../../src/services/UserHooks'
import { useCreateWorkflowWithOperations } from '../../../src/services/WizardHooks'
import { useRunWorkflowTriggerHistory } from '../../../src/services/WorkflowTriggerHooks'
import { WorkflowOutput } from '../../../src/typings/Workflow'
import { addPropToAllFields } from '../../../src/utils/schema.utils'

const integrationFragment = gql`
  fragment SetupBulkActionPage_Integration on Integration {
    id
    version
    key
    name
    logo
    integrationAccount {
      ...SelectCredentials_IntegrationAccount
    }
  }
  ${SelectCredentials.fragments.IntegrationAccount}
`

const integrationTriggerFragment = gql`
  fragment SetupBulkActionPage_IntegrationTrigger on IntegrationTrigger {
    id
    name
    skipAuth
    schemaRequest
    schemaResponse
  }
`

const integrationActionFragment = gql`
  fragment SetupBulkActionPage_IntegrationAction on IntegrationAction {
    id
    skipAuth
    schemaRequest
    schemaResponse
  }
`

function SetupBulkActionPage() {
  const { viewer } = useViewer()
  const { signer } = useRedirectGuests()
  const [createLoading, setCreateLoading] = useState(false)
  const [workflowRunStarted, setWorkflowRunStarted] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const {
    createWorflowWithOperations,
    workflow,
    workflowTrigger,
    workflowActions,
    error: createError,
  } = useCreateWorkflowWithOperations()
  const [runWorkflowTriggerHistory] = useRunWorkflowTriggerHistory()

  const [credentialIds, setCredentialIds] = useState<Record<string, string>>({})

  // stop loading on errors
  useEffect(() => {
    if (createError && createLoading) {
      setCreateLoading(false)
    }
  }, [createError, createLoading])

  // when workflow is created, start the execution and redirect to the workflow
  useEffect(() => {
    const run = async () => {
      if (workflowRunStarted) {
        return
      }
      setWorkflowRunStarted(true)
      await runWorkflowTriggerHistory({
        variables: {
          id: workflowTrigger!.id,
        },
      })
      router.push(`/workflows/${workflow!.id}?bulkAction=true`)
    }

    if (workflow && workflowTrigger && workflowActions?.length) {
      run()
    }
  }, [router, runWorkflowTriggerHistory, workflow, workflowActions, workflowRunStarted, workflowTrigger])

  const [sourceIntegrationKey, sourceOperationKey] = router.query.source?.toString().split(':') || []
  const [actionIntegrationKey, actionOperationKey] = router.query.action?.toString().split(':') || []
  const source = bulkDataSources.find(
    (source) => source.integrationKey === sourceIntegrationKey && source.operationKey === sourceOperationKey,
  )
  const action = bulkActions.find(
    (action) => action.integrationKey === actionIntegrationKey && action.operationKey === actionOperationKey,
  )

  // get unique integrations
  const integrationKeys = useMemo(
    () => [...new Set([source?.integrationKey ?? '', action?.integrationKey ?? ''])].filter((key) => !!key),
    [action?.integrationKey, source?.integrationKey],
  )
  const { data: integrationsData, loading: integrationsLoading } = useGetIntegrations(integrationFragment, {
    variables: {
      filter: {
        key: { in: integrationKeys },
      },
    },
  })
  const integrations = integrationsData?.integrations?.edges?.map((edge) => edge?.node) ?? []
  const sourceIntegration = integrations.find((integration) => integration.key === source?.integrationKey)
  const actionIntegration = integrations.find((integration) => integration.key === action?.integrationKey)

  const { data: integrationTriggerData, loading: integrationTriggerLoading } = useGetIntegrationTriggers(
    integrationTriggerFragment,
    {
      skip: !source || !sourceIntegration,
      variables: {
        filter: {
          integration: { eq: sourceIntegration?.id },
          key: { eq: source?.operationKey },
        },
      },
    },
  )
  const integrationTrigger = integrationTriggerData?.integrationTriggers?.edges?.[0]?.node

  const { data: integrationActionData, loading: integrationActionLoading } = useGetIntegrationActions(
    integrationActionFragment,
    {
      skip: !action || !actionIntegration,
      variables: {
        filter: {
          integration: { eq: actionIntegration?.id },
          key: { eq: action?.operationKey },
        },
      },
    },
  )
  const integrationAction = integrationActionData?.integrationActions?.edges?.[0]?.node

  const integrationsWithAuth = useMemo(
    () => [
      ...(integrationTrigger?.skipAuth || !sourceIntegration?.integrationAccount ? [] : [sourceIntegration]),
      ...(integrationAction?.skipAuth || !actionIntegration?.integrationAccount ? [] : [actionIntegration]),
    ],
    [actionIntegration, integrationAction?.skipAuth, integrationTrigger?.skipAuth, sourceIntegration],
  )

  const handleCredentialSelect = useCallback(
    (account: IntegrationAccount, id: string) => {
      if (credentialIds[account.id] !== id) {
        setCredentialIds({
          ...credentialIds,
          [account.id]: id,
        })
        setError(null)
      }
    },
    [credentialIds],
  )

  const handleCreate = async (inputs: Record<string, any>) => {
    // missing dependencies
    if (!source || !action || !sourceIntegration || !actionIntegration || !integrationTrigger || !integrationAction) {
      return
    }

    // check if all required credentials are selected
    const noConnectedAccounts = integrationsWithAuth.filter(
      (integration) => !credentialIds[integration.integrationAccount!.id],
    )
    if (noConnectedAccounts.length) {
      setError(
        new Error(`Please connect ${noConnectedAccounts.map((item) => item.integrationAccount!.name).join(' and ')}.`),
      )
      return
    }
    setCreateLoading(true)
    try {
      await createWorflowWithOperations({
        workflowName: `[Bulk Action] ${action.name} to all ${source.name}`, // TODO
        triggerIntegration: {
          key: sourceIntegration.key,
          version: sourceIntegration.version,
        },
        trigger: {
          key: source.operationKey,
          inputs, // TODO filter only source?
          schedule: {
            frequency: 'once',
            datetime: new Date().toISOString(),
          },
          name: source.name,
          credentialsId: sourceIntegration.integrationAccount
            ? credentialIds[sourceIntegration.integrationAccount.id]
            : undefined,
        },
        actions: [
          {
            key: action.operationKey,
            inputs: {
              ...inputs, // TODO filter only action?
              ...Object.entries(action.imports).reduce(
                (prev, [key, value]) => ({
                  ...prev,
                  [value]: `{{trigger.${source.exports[key]}}}`,
                }),
                {},
              ),
            },
            credentialsId: actionIntegration.integrationAccount
              ? credentialIds[actionIntegration.integrationAccount.id]
              : undefined,
          },
        ],
      })
    } catch (e) {
      setError(e as Error)
      setCreateLoading(false)
    }
  }

  const schema: JSONSchema7 = useMemo(
    () => ({
      ...(deepmerge(
        // source fields should not use interpolation (trigger outputs are only used for the action)
        addPropToAllFields(source?.schema ?? integrationTrigger?.schemaRequest ?? {}, 'x-noInterpolation', true),
        action?.schema ?? integrationAction?.schemaRequest ?? {},
      ) as JSONSchema7),
      type: 'object',
    }),
    [action?.schema, integrationAction?.schemaRequest, integrationTrigger?.schemaRequest, source?.schema],
  )

  const isLoading = integrationsLoading || integrationTriggerLoading || integrationActionLoading || createLoading

  const parentOutputs: WorkflowOutput[] = useMemo(
    () =>
      sourceIntegration && integrationTrigger
        ? [
            {
              nodeId: 'trigger',
              nodeName: integrationTrigger.name,
              nodeLogo: sourceIntegration.logo,
              schema: {
                ...integrationTrigger.schemaResponse,
                definitions: {
                  ...(integrationTrigger.schemaResponse?.definitions ?? {}),
                },
              },
            },
          ]
        : [],
    [integrationTrigger, sourceIntegration],
  )

  if (!signer || !viewer) {
    return <></>
  }

  return (
    <>
      <Head>
        <title>Create a Bulk Action</title>
      </Head>
      <PageWrapper title="Create a Bulk Action" extra={<OperationsUsed />}>
        <div className="container px-0 mx-auto lg:px-24">
          <Card className="w-full flex justify-center">
            <div className="w-full md:w-fit gap-4 my-8 mx-0 lg:mx-48">
              <div className="text-center text-2xl font-bold mb-8">Select Data Source and Action</div>
              <div className="text-center text-lg mb-12">
                To create a Bulk Action, select a data source and an action. The action will be executed for all items
                in the data source.
              </div>

              {isLoading && <Loading />}

              {!isLoading &&
                integrationsWithAuth.map((integration, i) => (
                  <div className="mb-8 border-l-4 border-indigo-500" key={i}>
                    <div className="flex flex-row gap-2 mb-2 ">
                      {integration.logo && <img src={integration.logo} width={24} height={24} alt={integration.name} />}
                      <strong>{integration.name} Account</strong>
                    </div>
                    <SelectCredentials
                      integrationAccount={integration.integrationAccount!}
                      onCredentialsSelected={(id) => handleCredentialSelect(integration.integrationAccount!, id)}
                      hideNameInput
                      hideSubmitButton
                    />
                  </div>
                ))}

              {!isLoading && integrationAction && (
                <ActionInputsForm
                  action="create"
                  integrationActionId={integrationAction.id}
                  workflowTriggerId={undefined}
                  parentActionIds={[]}
                  overwriteSchemaRequest={schema}
                  overwriteParentOutputs={parentOutputs}
                  accountCredentialId={
                    actionIntegration?.integrationAccount?.id
                      ? credentialIds[actionIntegration?.integrationAccount?.id]
                      : undefined
                  }
                  initialInputs={{}}
                  // onChange={handleInputsChange}
                  onSubmitActionInputs={handleCreate}
                />
              )}

              <div className="mt-8">
                {(error || createError) && (
                  <Alert message="Error" description={error?.message ?? createError} type="error" showIcon closable />
                )}
              </div>
            </div>
          </Card>
        </div>
      </PageWrapper>
    </>
  )
}

export default withApollo(SetupBulkActionPage)
