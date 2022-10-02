import { Alert, Button, Form, Input, Modal } from 'antd'
import { useState } from 'react'
import { Workflow } from '../../graphql'
import { useUpdateOneWorkflow } from '../../src/services/WorkflowHooks'

interface Props {
  workflow: Workflow
  visible: boolean
  onWorkflowRename: (name: string) => any
  onCancel: () => any
}

export const RenameWorkflowModal = ({ workflow, visible, onWorkflowRename, onCancel }: Props) => {
  const [updateWorkflow] = useUpdateOneWorkflow()
  const [name, setName] = useState(workflow.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateWorkflow({
        variables: {
          input: {
            id: workflow.id,
            update: {
              name,
            },
          },
        },
      })
      setLoading(false)
      onWorkflowRename(name)
    } catch (e) {
      setError((e as Error)?.message)
    }
  }

  return (
    <Modal
      title="Rename Workflow"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      <>
        {error && <Alert style={{ marginBottom: 16 }} message="Error" description={error} type="error" showIcon />}
        <Form form={form} name="workflow-form" onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Workflow Name"
            initialValue={name}
            rules={[{ required: true }]}
            className="mb-8"
          >
            <Input allowClear onChange={(e) => setName(e.target.value)} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </>
    </Modal>
  )
}
