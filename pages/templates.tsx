import Head from 'next/head'
import { PageWrapper } from '../components/common/PageLayout/PageWrapper'
import { RecommendedTemplates } from '../components/templates/RecommendedTemplates'
import { withApollo } from '../src/apollo'

function ExplorePage() {
  return (
    <>
      <Head>
        <title>Explore ChainJet Templates</title>
      </Head>
      <PageWrapper title="ChainJet Templates">
        <div className="container px-0 mx-auto lg:px-24">
          <RecommendedTemplates />
        </div>
      </PageWrapper>
    </>
  )
}

export default withApollo(ExplorePage)
