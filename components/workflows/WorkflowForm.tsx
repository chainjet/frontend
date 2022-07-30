import { gql } from '@apollo/client'
import { Alert, Button, Form, Input, Switch } from 'antd'
import React, { useEffect, useState } from 'react'
import { Workflow } from '../../graphql'
import { slugify } from '../../src/utils/strings'
import { WorkflowSelector } from './WorkflowSelector'

interface Props {
  workflow: Workflow
  showSubmit: boolean
  onSubmit: (workflow: Partial<Workflow>) => void
  onChange?: (key: keyof Workflow, value: any) => void
  loading?: boolean
  error: string | null
}

export const WorkflowForm = (props: Props) => {
  const { workflow, showSubmit, onSubmit, onChange, loading, error } = props
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
      runOnFailure
    } as Partial<Workflow>)
  }

  return (
    <>
      {
        error && <Alert
          style={{ marginBottom: 16 }}
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      }
      <Form
        form={form}
        name="workflow-form"
        onFinish={handleFormSubmit}
        layout="vertical"
      >

        <Form.Item name="name"
          label="Workflow Name"
          initialValue={name}
          rules={[{ required: true }]}
          help={name && `https://chainjet.io/${workflow.project.slug}/workflow/${slugify(name)}`}
          style={{ marginBottom: 32 }}>
          <Input allowClear onChange={e => handleNameChange(e.target.value)} />
        </Form.Item>

        {
          workflow.trigger && (
            <Form.Item name="maxConsecutiveFailures"
              label="Max consecutive failures"
              initialValue={workflow.trigger?.maxConsecutiveFailures}
              rules={[{ required: true }]}
              help="Stop the workflow after this number of consecutive failures. Set to zero to disable."
              style={{ marginBottom: 32 }}>
              <Input type="number" allowClear />
            </Form.Item>
          )
        }

        <div style={{ marginBottom: 32 }}>
          <Switch checked={runWorkflowOnFailureEnabled}
            onChange={handleWorkflowOnFailureToggle} />
          <span style={{ marginLeft: 8 }}>Run a workflow on failure</span>
        </div>

        {
          runWorkflowOnFailureEnabled && (
            <div style={{ marginBottom: 32 }}>
              <WorkflowSelector projectId={workflow.project.id}
                selectedWorkflowId={runOnFailure ?? undefined}
                onChange={handleRunOnFailureChange}
                filterWorkflows={wf => wf.id !== workflow.id} />
            </div>
          )
        }

        {
          showSubmit && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </Form.Item>
          )
        }

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
    }
  `,

  WorkflowTrigger: gql`
    fragment WorkflowForm_WorkflowTrigger on WorkflowTrigger {
      id
      maxConsecutiveFailures
    }
  `,

  Project: gql`
    fragment WorkflowForm_Project on Project {
      id
      slug
    }
  `
}
