import Head from 'next/head'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { OperationsUsed } from '../components/users/OperationsUsed'
import { PlanMigrationAlert } from '../components/users/PlanMigrationAlert'
import { UserWorkflows } from '../components/workflows/UserWorkflows'
import { withApollo } from '../src/apollo'
import { useRedirectGuests } from '../src/services/UserHooks'
import { ChainJetAIAlert } from '../components/users/ChainJetAIAlert'

function WorkflowsPage() {
  const { signer } = useRedirectGuests()

  if (!signer) {
    return <></>
  }

  return (
    <>
      <Head>
        <title>ChainJet Workflows</title>
      </Head>
      <PageWrapper title="Workflows" extra={<OperationsUsed />}>
        <ChainJetAIAlert />
        <PlanMigrationAlert />
        <UserWorkflows />
      </PageWrapper>
    </>
  )
}

export default withApollo(WorkflowsPage)
