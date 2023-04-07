import { Alert } from 'antd'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useViewer } from '../../src/services/UserHooks'
const advancedFormat = require('dayjs/plugin/advancedFormat')

export function PlanMigrationAlert() {
  const { viewer } = useViewer()

  if (viewer?.plan !== 'early') {
    return <></>
  }

  dayjs.extend(advancedFormat)

  const operationsResetDate = new Date(viewer.operationsReset.toString())
  const migrationDate =
    operationsResetDate < new Date('2023-04-15 00:00 UTC')
      ? new Date(operationsResetDate.setMonth(operationsResetDate.getMonth() + 1))
      : operationsResetDate

  return (
    <div className="text-center py-2 px-0 lg:px-36 xl:px-48 mb-8">
      <Alert
        type="info"
        message={
          <>
            After 9 months of offering ChainJet for free, we&#39;re introducing subscriptions. From{' '}
            {dayjs(migrationDate).format('MMMM Do')}, enjoy our Free plan or{' '}
            <Link href="/pricing">choose a subscription</Link> to unlock more features.
          </>
        }
      />
    </div>
  )
}
