import { gql } from '@apollo/client'
import { Alert, Button, Form, Input, Switch } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import { useEffect, useState } from 'react'
import { Workflow } from '../../graphql'
import { WorkflowSelector } from './WorkflowSelector'

interface Props {
  workflow: Workflow
  showSubmit: boolean
  onSubmit: (workflow: Partial<Workflow>) => void
  onChange?: (key: keyof Workflow, value: any) => void
  loading?: boolean
  error: string | null
}

export const WorkflowForm = ({ workflow, showSubmit, onSubmit, onChange, loading, error }: Props) => {
  const [name, setName] = useState(workflow?.name ?? '')
  const [runWorkflowOnFailureEnabled, setRunWorkflowOnFailureEnabled] = useState(!!workflow.runOnFailure)
  const [runOnFailure, setRunOnFailure] = useState<string | null>(workflow.runOnFailure ?? null)
  const [form] = Form.useForm()

  useEffect(() => {
    setName(workflow?.name ?? '')
  }, [workflow])

  const handleNameChange = (value: string) => {
    setName(value)
    onChange?.('name', value)
  }

  const handleWorkflowOnFailureToggle = () => {
    setRunWorkflowOnFailureEnabled(!runWorkflowOnFailureEnabled)
    setRunOnFailure(null)
  }

  const handleRunOnFailureChange = (workflowId: string) => {
    onChange?.('runOnFailure', workflowId)
    setRunOnFailure(workflowId)
  }

  const handleFormSubmit = (workflow: Partial<Workflow>) => {
    onSubmit({
      ...workflow,
      runOnFailure,
    } as Partial<Workflow>)
  }

  return (
    <>
      {error && <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />}
      <Form form={form} name="workflow-form" onFinish={handleFormSubmit} layout="vertical">
        <Form.Item
          name="name"
          label="Workflow Name"
          initialValue={name}
          rules={[{ required: true }]}
          style={{ marginBottom: 32 }}
        >
          <Input allowClear onChange={(e) => handleNameChange(e.target.value)} />
        </Form.Item>

        {workflow.trigger && (
          <Form.Item
            name="maxConsecutiveFailures"
            label="Max consecutive failures"
            initialValue={workflow.trigger?.maxConsecutiveFailures}
            rules={[{ required: true }]}
            help="Stop the workflow after this number of consecutive failures. Set to zero to disable. Up to 1 failure is counted every 3 hours."
            style={{ marginBottom: 46 }}
          >
            <Input type="number" allowClear />
          </Form.Item>
        )}

        <div style={{ marginBottom: 32 }}>
          <Switch checked={runWorkflowOnFailureEnabled} onChange={handleWorkflowOnFailureToggle} />
          <span style={{ marginLeft: 8 }}>Run a workflow on failure</span>
        </div>

        {workflow.isTemplate && (
          <div className="mb-8">
            <Form.Item
              name="templateSchema"
              label="Template Schema (Advanced)"
              initialValue={JSON.stringify(workflow.templateSchema, null, 2)}
              rules={[{ required: true }]}
              help="Define the JSON Schema for the use template modal. Only for advanced users."
              style={{ marginBottom: 46 }}
            >
              <TextArea rows={4} />
            </Form.Item>
          </div>
        )}

        {runWorkflowOnFailureEnabled && (
          <div style={{ marginBottom: 32 }}>
            <WorkflowSelector
              selectedWorkflowId={runOnFailure ?? undefined}
              onChange={handleRunOnFailureChange}
              filterWorkflows={(wf) => wf.id !== workflow.id}
            />
          </div>
        )}

        {showSubmit && (
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        )}
      </Form>
    </>
  )
}

WorkflowForm.fragments = {
  Workflow: gql`
    fragment WorkflowForm_Workflow on Workflow {
      id
      name
      runOnFailure
      templateSchema
      isTemplate
    }
  `,

  WorkflowTrigger: gql`
    fragment WorkflowForm_WorkflowTrigger on WorkflowTrigger {
      id
      maxConsecutiveFailures
    }
  `,
}
