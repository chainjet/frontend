import React from 'react'
import { Button, Modal } from 'antd'

interface Props {
  modalTitle?: string
  message: string | JSX.Element
  visible: boolean
  onDelete: () => void
  onCancel: () => void
  loading?: boolean
}

export const DeleteConfirmationModal = (props: Props) => {
  const { modalTitle, message, visible, onDelete, onCancel, loading } = props
  return (
    <Modal
      visible={visible}
      title={modalTitle || 'Are you sure?'}
      onOk={onDelete}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          No, cancel
        </Button>,
        <Button danger key="submit" type="primary" loading={!!loading} onClick={onDelete}>
          Yes, delete
        </Button>,
      ]}
    >
      <p>{message ? message : 'Are you sure you want to delete this?'}</p>
    </Modal>
  )
}
