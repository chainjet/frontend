import Head from 'next/head'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { NotificationWizard } from '../../components/wizards/notifications/NotificationWizard'
import { withApollo } from '../../src/apollo'

function CreateNotificationPage() {
  return (
    <>
      <Head>
        <title>Create a smart contract notification</title>
      </Head>
      <PageWrapper title="Create a smart contract notification">
        <div className="container max-w-4xl mx-auto">
          <NotificationWizard />
        </div>
      </PageWrapper>
    </>
  )
}

export default withApollo(CreateNotificationPage)
