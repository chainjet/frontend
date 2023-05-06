import Head from 'next/head'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { NotificationWizard } from '../../components/wizards/notifications/NotificationWizard'
import { withApollo } from '../../src/apollo'
import { getHeadMetatags } from '../../src/utils/html.utils'

function CreateNotificationPage() {
  return (
    <>
      <Head>
        {getHeadMetatags({
          path: '/create/notification',
          title: 'Receive Web3 Notifications',
          description: 'Receive Web3 Notifications by by Email, Discord, Telegram, or XMTP.',
        })}
      </Head>
      <PageWrapper title="Web3 Notifications">
        <div className="container max-w-4xl mx-auto">
          <NotificationWizard />
        </div>
      </PageWrapper>
    </>
  )
}

export default withApollo(CreateNotificationPage)
