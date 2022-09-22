import { Alert, Modal } from 'antd'
import { useConnect } from 'wagmi'
import { Loading } from '../common/RequestStates/Loading'

interface Props {
  visible: boolean
  onCancel: () => void
}

export default function ConnectWalletModal({ visible, onCancel }: Props) {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

  const images: { [key: string]: string } = {
    metaMask: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/metamask.svg',
    coinbaseWallet: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/coinbase.svg',
    walletConnect: 'https://raw.githubusercontent.com/chainjet/assets/master/integrations/wallet-connect.svg',
  }

  return (
    <Modal title="Connect Wallet" visible={visible} onCancel={onCancel} footer={null}>
      <div>
        {connectors.map((connector) => (
          <button
            className="inline-flex items-center justify-center w-full px-4 py-2 mb-4 font-bold text-gray-800 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {isLoading && connector.id === pendingConnector?.id ? (
              <Loading />
            ) : (
              <>
                {images[connector.id] && (
                  <img src={images[connector.id]} alt={`${connector.name} Logo`} width={36} height={36} />
                )}
                <strong className="ml-1">{connector.name}</strong>
                {!connector.ready && ' (unsupported)'}
              </>
            )}
          </button>
        ))}
      </div>
      {error && <Alert style={{ marginBottom: 16 }} message={error?.message} type="error" showIcon />}
    </Modal>
  )
}
