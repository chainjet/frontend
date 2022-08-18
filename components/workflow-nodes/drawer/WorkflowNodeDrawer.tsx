import { Divider, Drawer, Steps } from 'antd'
import { JSONSchema7 } from 'json-schema'
import { useState } from 'react'
import { Integration, IntegrationAction, IntegrationTrigger } from '../../../graphql'
import { integrationCategories } from '../../../src/constants/integration-categories'
import { GoogleAnalyticsService } from '../../../src/services/GoogleAnalyticsService'
import { ActionInputsForm } from './steps/ActionInputsForm'
import { SelectCredentials } from './steps/SelectCredentials'
import { SelectIntegration } from './steps/SelectIntegration'
import { SelectWorkflowAction } from './steps/SelectWorkflowAction'
import { SelectWorkflowTrigger } from './steps/SelectWorkflowTrigger'
import { TriggerInputsForm } from './steps/TriggerInputsForm'

type TriggerProps = {
  nodeType: 'trigger'
}

type ActionProps = {
  nodeType: 'action'

  // required for fetching outputs from previous nodes
  workflowTriggerId: string | undefined
  parentActionIds: string[]
}

type Props<T extends IntegrationTrigger | IntegrationAction> = (TriggerProps | ActionProps) & {
  title: string
  visible: boolean

  // load the drawer with initial data, used for updating trigger and actions
  initialNode?: T
  initialNodeInputs?: Record<string, any>
  initialCredentialId?: string
  extraSchemaProps?: JSONSchema7

  overrideStep?: JSX.Element

  onSubmitInputs: (inputs: Record<string, any>, node: T, credentialsID?: string) => void
  onCancel: () => void
}

export function WorkflowNodeDrawer<T extends IntegrationTrigger | IntegrationAction>(props: Props<T>) {
  const {
    title,
    visible,
    initialNode,
    initialNodeInputs,
    initialCredentialId,
    overrideStep,
    extraSchemaProps,
    onSubmitInputs,
  } = props
  const [currentStep, setCurrentStep] = useState(initialNodeInputs ? 3 : 0)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | undefined>()
  const [selectedNode, setSelectedNode] = useState<T | undefined>(initialNode)
  const [selectedCredentialID, setSelectedCredentialID] = useState<string | undefined>(initialCredentialId)

  const onCancel = () => {
    setCurrentStep(0)
    setSelectedIntegration(undefined)
    setSelectedNode(undefined)
    setSelectedCredentialID(undefined)
    props.onCancel()
  }

  const onIntegrationSelected = (integration: Integration) => {
    setSelectedIntegration(integration)
    setCurrentStep(1)
    GoogleAnalyticsService.sendEvent({
      action: 'integration_selected',
      category: 'engagement',
      label: integration.key,
    })
  }

  const onWorkflowStepSelected = (integrationStep: T) => {
    setSelectedNode(integrationStep)
    setCurrentStep(selectedIntegration?.integrationAccount?.id ? 2 : 3)
    GoogleAnalyticsService.sendEvent({
      action: props.nodeType === 'trigger' ? 'trigger_selected' : 'action_selected',
      category: 'engagement',
      label: selectedIntegration?.key + '_' + integrationStep.name,
    })
  }

  const onCredentialsSelected = (credentialId: string) => {
    setSelectedCredentialID(credentialId)
    setCurrentStep(3)
    GoogleAnalyticsService.sendEvent({
      action: 'credentials_selected',
      category: 'engagement',
      label: selectedIntegration?.key,
    })
  }

  const renderCurrentStep = (stepIndex: number): JSX.Element => {
    if (overrideStep) {
      return overrideStep
    }
    switch (stepIndex) {
      // Select Integration
      case 0:
        const initialCategory = integrationCategories.find((category) => category.id === 'popular')
        return (
          <SelectIntegration
            onIntegrationSelect={onIntegrationSelected}
            nodeType={props.nodeType}
            initialCategory={initialCategory}
          />
        )

      // Select Operation
      case 1:
        if (!selectedIntegration) {
          return renderCurrentStep(0)
        }
        if (props.nodeType === 'trigger') {
          return (
            <SelectWorkflowTrigger
              integration={selectedIntegration}
              onTriggerSelected={(trigger) => onWorkflowStepSelected(trigger as T)}
            />
          )
        } else {
          return (
            <SelectWorkflowAction
              integration={selectedIntegration}
              onOperationSelected={(action) => onWorkflowStepSelected(action as T)}
            />
          )
        }

      // Select Credentials
      case 2:
        if (!selectedIntegration) {
          return renderCurrentStep(0)
        }
        if (selectedNode?.skipAuth) {
          return renderCurrentStep(3)
        }
        return (
          <SelectCredentials
            integrationAccount={selectedIntegration.integrationAccount!}
            onCredentialsSelected={onCredentialsSelected}
          />
        )

      // Select Inputs
      case 3:
        if (!selectedNode) {
          return renderCurrentStep(1)
        }
        if (props.nodeType === 'trigger') {
          return (
            <TriggerInputsForm
              triggerId={selectedNode.id}
              initialInputs={initialNodeInputs || {}}
              extraSchemaProps={extraSchemaProps}
              onSubmitOperationInputs={(inputs) => onSubmitInputs(inputs, selectedNode, selectedCredentialID)}
            />
          )
        } else {
          return (
            <ActionInputsForm
              integrationActionId={selectedNode.id}
              workflowTriggerId={props.workflowTriggerId}
              parentActionIds={props.parentActionIds}
              accountCredentialId={selectedCredentialID}
              initialInputs={initialNodeInputs || {}}
              extraSchemaProps={extraSchemaProps}
              onSubmitActionInputs={(inputs) => onSubmitInputs(inputs, selectedNode, selectedCredentialID)}
            />
          )
        }
      default:
        return <></>
    }
  }

  return (
    <Drawer
      title={title}
      placement="right"
      closable={true}
      onClose={onCancel}
      visible={visible}
      width={window.innerWidth}
    >
      <div className="hidden sm:block">
        <Steps size="small" current={currentStep}>
          <Steps.Step title="Select Integration" description="" />
          <Steps.Step title="Select Operation" description="" />
          <Steps.Step title="Select Account" description="" />
          <Steps.Step title="Set Inputs" description="" />
        </Steps>

        <Divider />
      </div>

      {renderCurrentStep(currentStep)}
    </Drawer>
  )
}
