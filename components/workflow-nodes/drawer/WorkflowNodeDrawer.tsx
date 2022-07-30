import React, { useState } from 'react'
import { Divider, Drawer, Steps } from 'antd'
import { JSONSchema7 } from 'json-schema'
import { SelectIntegration } from './steps/SelectIntegration'
import { SelectCredentials } from './steps/SelectCredentials'
import { SelectWorkflowTrigger } from './steps/SelectWorkflowTrigger'
import { SelectWorkflowAction } from './steps/SelectWorkflowAction'
import { TriggerInputsForm } from './steps/TriggerInputsForm'
import { ActionInputsForm } from './steps/ActionInputsForm'
import { Integration, IntegrationAction, IntegrationTrigger } from '../../../graphql'

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

export function WorkflowNodeDrawer<T extends IntegrationTrigger | IntegrationAction> (props: Props<T>) {
  const {
    title,
    visible,
    initialNode,
    initialNodeInputs,
    initialCredentialId,
    overrideStep,
    extraSchemaProps,
    onSubmitInputs
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
  }

  const onWorkflowStepSelected = (integrationStep: T) => {
    setSelectedNode(integrationStep)
    setCurrentStep(selectedIntegration?.integrationAccount?.id ? 2 : 3)
  }

  const onCredentialsSelected = (credentialId: string) => {
    setSelectedCredentialID(credentialId)
    setCurrentStep(3)
  }

  const renderCurrentStep = (stepIndex: number): JSX.Element => {
    if (overrideStep) {
      return overrideStep
    }
    switch (stepIndex) {
      // Select Integration
      case 0:
        return <SelectIntegration onIntegrationSelect={onIntegrationSelected} nodeType={props.nodeType}/>

      // Select Operation
      case 1:
        if (!selectedIntegration) {
          return renderCurrentStep(0)
        }
        if (props.nodeType === 'trigger') {
          return <SelectWorkflowTrigger integration={selectedIntegration}
                                        onTriggerSelected={trigger => onWorkflowStepSelected(trigger as T)}/>
        } else {
          return <SelectWorkflowAction integration={selectedIntegration}
                                       onOperationSelected={action => onWorkflowStepSelected(action as T)}/>
        }
      
      // Select Credentials
      case 2:
        if (!selectedIntegration) {
          return renderCurrentStep(0)
        }
        if (selectedNode?.skipAuth) {
          return renderCurrentStep(3)
        }
        return <SelectCredentials integrationAccount={selectedIntegration.integrationAccount!}
                                  onCredentialsSelected={onCredentialsSelected}/>

      // Select Inputs
      case 3:
        if (!selectedNode) {
          return renderCurrentStep(1)
        }
        if (props.nodeType === 'trigger') {
          return <TriggerInputsForm trigger={selectedNode as IntegrationTrigger}
                                    initialInputs={initialNodeInputs || {}}
                                    extraSchemaProps={extraSchemaProps}
                                    onSubmitOperationInputs={
                                      inputs => onSubmitInputs(inputs, selectedNode, selectedCredentialID)
                                    }/>
        } else {
          return <ActionInputsForm integrationAction={selectedNode as IntegrationAction}
                                   workflowTriggerId={props.workflowTriggerId}
                                   parentActionIds={props.parentActionIds}
                                   accountCredentialId={selectedCredentialID}
                                   initialInputs={initialNodeInputs || {}}
                                   extraSchemaProps={extraSchemaProps}
                                   onSubmitActionInputs={
                                     inputs => onSubmitInputs(inputs, selectedNode, selectedCredentialID)
                                   }/>
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
      <Steps size="small" current={currentStep}>
        <Steps.Step title="Select Integration" description=""/>
        <Steps.Step title="Select Operation" description=""/>
        <Steps.Step title="Select Account" description=""/>
        <Steps.Step title="Set Inputs" description=""/>
      </Steps>

      <Divider/>

      {renderCurrentStep(currentStep)}

    </Drawer>
  )
}
