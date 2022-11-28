import { Button } from 'antd'
import { useRouter } from 'next/router'
import React from 'react'
import { getLoginUrl } from '../../src/utils/account.utils'

export function ConnectWalletButton() {
  const router = useRouter()

  return (
    <Button type="primary" href={getLoginUrl(router)}>
      Connect Wallet
    </Button>
  )
}
