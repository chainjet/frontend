import { Alert, Button, Modal } from 'antd'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  open?: boolean
  onContinue: () => any
  onCancel: () => any
}

export const BulkActionsFreePlanModal = ({ open = true, onContinue, onCancel }: Props) => {
  const [loading, setLoading] = useState(false)

  return (
    <Modal
      title="Unlock the full power of Bulk Actions"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={Math.min(window.innerWidth, 650)}
    >
      <div>
        <div className="mb-8">
          <Alert
            message={
              <>
                Bulk Actions are limited to <strong>50</strong> items on Free plans. Please consider upgrading your plan
                to unlock the full power of Bulk Actions.
              </>
            }
          />
        </div>
        <div className="flex flex-row gap-4 items-center">
          <div>
            <Link href="/pricing">
              <Button type="primary" loading={loading} onClick={() => setLoading(true)}>
                See Plans
              </Button>
            </Link>
          </div>
          <div>
            <a href="#" onClick={onContinue}>
              Continue with free plan
            </a>
          </div>
        </div>
      </div>
    </Modal>
  )
}
