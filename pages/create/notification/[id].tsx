import { Divider } from 'antd'
import Card from 'antd/lib/card/Card'
import { NextPageContext } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { PageWrapper } from '../../../components/common/PageLayout/PageWrapper'
import { NotificationStep } from '../../../components/wizards/notifications/NotificationStep'
import { withApollo } from '../../../src/apollo'
import { notificationTriggers } from '../../../src/constants/notification-triggers'
import { useViewer } from '../../../src/services/UserHooks'
import { getHeadMetatags } from '../../../src/utils/html.utils'
import { getQueryParam } from '../../../src/utils/nextUtils'

interface Props {
  notificationTriggerId?: string
}

export function NotificationTriggerPage({ notificationTriggerId }: Props) {
  const notificationTrigger = useMemo(
    () => notificationTriggers.find((trigger) => trigger.id === notificationTriggerId),
    [notificationTriggerId],
  )
  const { viewer } = useViewer()
  const router = useRouter()

  if (!notificationTrigger) {
    return <>Notification Not Found</>
  }

  const handleGoBack = async () => {
    await router.push('/create/notification')
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: `/create/notification/${notificationTrigger.id}`,
          title: notificationTrigger.name,
          description: `${notificationTrigger.description}. Receive Web3 Notifications by by Email, Discord, Telegram, or XMTP.`,
          image: notificationTrigger.image,
        })}
      </Head>
      <PageWrapper title={notificationTrigger.name} onBack={handleGoBack}>
        <div className="container max-w-4xl mx-auto">
          <Card>
            <div className="mb-8 text-xl text-center">{notificationTrigger.description}</div>
            {!viewer && (
              <div className="mb-4 text-lg">
                <Divider />
                You need to{' '}
                <Link href={`/login?go=/create/notification/${notificationTrigger.id}`}>connect your wallet</Link> to
                before creating the notification.
                <Divider />
              </div>
            )}
            <NotificationStep notificationTrigger={notificationTrigger} readonly={!viewer} />
          </Card>
        </div>
      </PageWrapper>
    </>
  )
}

NotificationTriggerPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  const notificationTriggerId = getQueryParam(ctx, 'id').toLowerCase()
  const notificationTrigger = notificationTriggers.find((trigger) => trigger.id === notificationTriggerId)
  if (!notificationTrigger) {
    if (ctx.res) {
      ctx.res.statusCode = 404
      ctx.res.statusMessage = 'Not Found'
    }
    return {}
  }
  return {
    notificationTriggerId,
  }
}

export default withApollo(NotificationTriggerPage)
