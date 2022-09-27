import { Alert } from 'antd'
import Link from 'next/link'
import { useAccount, useConnect } from 'wagmi'
import { Loading } from '../common/RequestStates/Loading'
import { SignInWithEthereum } from './SignInWithEthereum'

export function ConnectWallet({
  onSuccess,
  onError,
  beforeLogin,
  message,
  showMigrationLink,
}: {
  onSuccess: (args: { address: string }) => void
  onError: (args: { error: Error }) => void
  beforeLogin?: (data: string) => Promise<boolean>
  message?: string
  showMigrationLink?: boolean
}) {
  const { isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

  const images: { [key: string]: string } = {
    metaMask: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/metamask.svg',
    coinbaseWallet: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/coinbase.svg',
    walletConnect: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/wallet-connect.svg',
    injected: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/wallet-injected.svg',
  }

  if (isConnected) {
    return <SignInWithEthereum onSuccess={onSuccess} onError={onError} beforeLogin={beforeLogin} />
  }

  return (
    <>
      <div className="mb-6 text-lg text-center">{message ?? 'Connect your wallet with ChainJet'}</div>
      {error && <Alert message={error?.message} type="error" showIcon style={{ marginBottom: 24 }} />}
      {connectors.map((connector) => (
        <button
          className="inline-flex items-center justify-center w-full px-4 py-2 mb-4 text-xl text-white rounded cursor-pointer bg-primary hover:bg-primary-hover"
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {isLoading && connector.id === pendingConnector?.id ? (
            <Loading />
          ) : (
            <>
              {images[connector.id] && (
                <img src={images[connector.id]} alt={`${connector.name} Logo`} width={28} height={28} />
              )}
              <strong className="ml-1">{connector.name}</strong>
              {!connector.ready && <span className="ml-1"> (extension not found)</span>}
            </>
          )}
        </button>
      ))}
      {showMigrationLink && (
        <div className="grid mt-8 text-center">
          <span className="">
            Do you have a non-wallet account?{' '}
            <Link href="/migrate">
              <a className="text-primary">Migrate it here</a>
            </Link>
            .
          </span>
        </div>
      )}
    </>
  )
}
