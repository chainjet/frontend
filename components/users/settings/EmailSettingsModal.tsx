import { Modal } from 'antd'
import { User } from '../../../graphql'
import { ProfileEmailForm } from './ProfileEmailForm'

interface Props {
  user: User
  open: boolean
  onUserUpdate: () => any
  onCancel: () => any
}

export const EmailSettingsModal = ({ user, open, onUserUpdate, onCancel }: Props) => {
  return (
    <Modal
      title="Enable email notifications"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={Math.min(window.innerWidth, 800)}
    >
      <ProfileEmailForm user={user} onUserUpdate={onUserUpdate} subscriptionsDefaultEnabled />
    </Modal>
  )
}

EmailSettingsModal.fragments = ProfileEmailForm.fragments
