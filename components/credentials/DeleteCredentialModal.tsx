import { WarningOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { AccountCredential } from '../../graphql'
import { useDeleteOneAccountCredential } from '../../src/services/AccountCredentialHooks'
import { DeleteConfirmationModal } from '../common/Modals/DeleteConfirmationModal'

interface Props {
  accountCredential: AccountCredential
  visible: boolean
  onDeleteAccountCredential: (id: string) => any
  onCancel: () => any
}

export const DeleteCredentialModal = ({ accountCredential, visible, onDeleteAccountCredential, onCancel }: Props) => {
  const [deleteAccountCredential] = useDeleteOneAccountCredential()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await deleteAccountCredential({
      variables: {
        input: {
          id: accountCredential.id,
        },
      },
    })
    setLoading(false)
    onDeleteAccountCredential(accountCredential.id)
  }

  return (
    <DeleteConfirmationModal
      message={
        <>
          Are you sure you want to delete the credential <strong>{accountCredential.name}</strong>?<br />
          <br />
          <WarningOutlined /> This action cannot be undone.
        </>
      }
      visible={visible}
      onDelete={handleDelete}
      onCancel={onCancel}
      loading={loading}
    />
  )
}
