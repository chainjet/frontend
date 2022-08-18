import { NextPageContext } from 'next'
import Head from 'next/head'
import { IntegrationPageContainer } from '../../../components/integrations/IntegrationsPageContainer'
import { withApollo } from '../../../src/apollo'
import { integrationCategories } from '../../../src/constants/integration-categories'
import { getHeadMetatags } from '../../../src/utils/html.utils'
import { getQueryParam } from '../../../src/utils/nextUtils'
import Error404Page from '../../404'

interface Props {
  categoryId: string
}

function IntegrationCategoryPage(props: Props) {
  const { categoryId } = props
  const category = integrationCategories.find((category) => category.id === categoryId)

  if (!category) {
    return <Error404Page /> // TODO soft 404
  }

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: `/integrations/category/${category.id}`,
          title: `No-Code Automation for ${category.name}`,
          description: `Build automations for ${category.name} without writing any code.`,
        })}
      </Head>
      <IntegrationPageContainer category={category} />
    </>
  )
}

IntegrationCategoryPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    categoryId: getQueryParam(ctx, 'category').toLowerCase(),
  }
}

export default withApollo(IntegrationCategoryPage, { useLayout: false })
