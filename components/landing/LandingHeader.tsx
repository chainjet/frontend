import { Button } from 'antd'
import Link from 'next/link'
import { useSigner } from '../../src/services/UserHooks'

export function LandingHeader() {
  const { signer } = useSigner()

  return (
    <header className="bg-secondary">
      <div className="container flex items-center w-full px-4 mx-auto max-w-7xl" style={{ height: 113 }}>
        <div>
          <Link href="/">
            <a className="cursor-pointer">
              <img src="/img/logo.png" alt="ChainJet Logo" className="w-40 md:w-72" />
            </a>
          </Link>
        </div>
        <div className="justify-end w-full text-right">
          {signer ? (
            <Link href="/dashboard">
              <Button type="primary" style={{ width: 140, height: 40 }}>
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button type="primary" style={{ width: 140, height: 40 }}>
                Connect Wallet
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
