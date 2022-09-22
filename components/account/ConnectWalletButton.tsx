import { Button } from 'antd'
import { useState } from 'react'
import ConnectWalletModal from './ConnectWalletModal'

export default function ConnectWalletButton() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button type="primary" onClick={() => setModalOpen(true)}>
        Connect Wallet
      </Button>
      <ConnectWalletModal visible={modalOpen} onCancel={() => setModalOpen(false)} />
    </>
  )
}
