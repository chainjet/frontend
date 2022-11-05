import { Alert, Button, Modal } from 'antd'
import { useState } from 'react'
import { Workflow } from '../../graphql'
import { useUpdateOneWorkflow } from '../../src/services/WorkflowHooks'

interface Props {
  workflow: Workflow
  visible: boolean
  onPrivacyChange: () => void
  onCancel: () => void
}

export const ChangeWorkflowPrivacyModal = ({ workflow, visible, onPrivacyChange, onCancel }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateWorkflow] = useUpdateOneWorkflow()

  const handlePrivacyChange = async () => {
    setLoading(true)
    try {
      const res = await updateWorkflow({
        variables: {
          input: {
            id: workflow.id,
            update: {
              isPublic: !workflow.isPublic,
            },
          },
        },
      })
      onPrivacyChange()
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
    }
  }

  const changingTo = workflow.isPublic ? 'private' : 'public'

  return (
    <Modal
      visible={visible}
      title={
        <>
          Are you sure you want to make your workflow <strong>{changingTo}</strong>
        </>
      }
      onOk={handlePrivacyChange}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          No, cancel
        </Button>,
        <Button danger key="submit" type="primary" loading={!!loading} onClick={handlePrivacyChange}>
          Yes, make it {changingTo}
        </Button>,
      ]}
    >
      <div>
        {workflow.isPublic && <Alert type="info" message="Private workflows can only be accessed by you." />}
        {!workflow.isPublic && (
          <Alert
            type="info"
            message="Public workflows are accessible by anyone. However, only you will be able to make changes or execute it."
          />
        )}
        {error && <Alert message="Error" description={error} type="error" showIcon closable />}
      </div>
    </Modal>
  )
}
