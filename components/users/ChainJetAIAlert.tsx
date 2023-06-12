import { Alert } from 'antd'
import { useState } from 'react'
import { AI_WAITLIST } from '../../src/constants/user-features'
import { useViewer } from '../../src/services/UserHooks'
import { RainbowText } from '../common/RainbowText'
import { AiWaitlistModal } from './Modals/AiWaitlistModal'

export function ChainJetAIAlert() {
  const { viewer, refetch } = useViewer()
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  if (!viewer || viewer.features?.[AI_WAITLIST]) {
    return <></>
  }

  const handleClick = () => {
    setModalOpen(true)
  }

  const handleClose = async () => {
    setModalOpen(false)
    if (refetch) {
      await refetch()
    }
  }

  return (
    <>
      <div className="px-0 py-2 mb-8 text-center cursor-pointer lg:px-36 xl:px-48" onClick={handleClick}>
        <Alert
          type="info"
          message={
            <a>
              🤖 <RainbowText text="ChainJet AI" /> is coming soon. Join the <RainbowText text="waitlist" /> now.
            </a>
          }
        />
      </div>
      {modalOpen && <AiWaitlistModal open onClose={handleClose} />}
    </>
  )
}
