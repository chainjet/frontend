import { ArrowLeftOutlined } from '@ant-design/icons'
import { Drawer } from 'antd'
import { JSONSchema7 } from 'json-schema'
import { useState } from 'react'
import { Integration, IntegrationAction, IntegrationTrigger } from '../../../graphql'
import { integrationCategories } from '../../../src/constants/integration-categories'
import { GoogleAnalyticsService } from '../../../src/services/GoogleAnalyticsService'
import { ActionInputsForm } from './steps/ActionInputsForm'
import { SelectCredentials } from './steps/SelectCredentials'
import { SelectIntegration } from './steps/SelectIntegration'
import { SelectTrigger } from './steps/SelectTrigger'
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
  action: 'create' | 'update'

  // load the drawer with initial data, used for updating trigger and actions
  initialNode?: T
  initialNodeInputs?: Record<string, any>
  initialCredentialId?: string
  extraSchemaProps?: JSONSchema7

  overrideStep?: JSX.Element

  onSubmitInputs: (inputs: Record<string, any>, node: T, credentialsID?: string) => Promise<any>
  onCancel: () => void
}

export function WorkflowNodeDrawer<T extends IntegrationTrigger | IntegrationAction>(props: Props<T>) {
  const {
    title,
    visible,
    action,
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
        if (props.nodeType === 'trigger') {
          return (
            <SelectTrigger
              onIntegrationSelect={onIntegrationSelected}
              onTriggerSelected={(trigger) => onWorkflowStepSelected(trigger as T)}
              onCredentialsSelected={onCredentialsSelected}
              onSubmitTriggerInputs={onSubmitInputs as any}
            />
          )
        }
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
              accountCredentialId={selectedCredentialID}
              initialInputs={initialNodeInputs || {}}
              extraSchemaProps={extraSchemaProps}
              onSubmitOperationInputs={(inputs) => onSubmitInputs(inputs, selectedNode, selectedCredentialID)}
            />
          )
        } else {
          return (
            <ActionInputsForm
              action={action}
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

  const onPreviousStep = (index: number) => {
    // if trying to go back to step 2 but auth is not needed, go back to 1
    if (index === 2 && (!selectedIntegration?.integrationAccount?.id || selectedNode?.skipAuth)) {
      setCurrentStep(1)
    } else {
      setCurrentStep(index)
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
      {/* <div className="hidden sm:block">
        <Steps size="small" current={currentStep}>
          <Steps.Step title="Select Integration" description="" onStepClick={onPreviousStep} />
          <Steps.Step
            title="Select Operation"
            description=""
            {...(currentStep > 1 ? { onStepClick: onPreviousStep } : {})}
          />
          <Steps.Step
            title="Select Account"
            description=""
            {...(currentStep > 2 ? { onStepClick: onPreviousStep } : {})}
          />
          <Steps.Step title="Set Inputs" description="" {...(currentStep > 3 ? { onStepClick: onPreviousStep } : {})} />
        </Steps>

        <Divider />
      </div> */}

      {currentStep > 0 && (
        <div className="flex items-center gap-1 mb-4 cursor-pointer" onClick={() => onPreviousStep(currentStep - 1)}>
          <ArrowLeftOutlined />
          <span className="font-bold">Back</span>
        </div>
      )}

      {renderCurrentStep(currentStep)}
    </Drawer>
  )
}
