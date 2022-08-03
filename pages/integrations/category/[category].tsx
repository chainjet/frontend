import Head from 'next/head'
import React from 'react'
import { withApollo } from '../../../src/apollo'
import { NextPageContext } from 'next'
import { getQueryParam } from '../../../src/utils/nextUtils'
import { useGetIntegrationCategory } from '../../../src/services/IntegrationCategoryHooks'
import { Loading } from '../../../components/common/RequestStates/Loading'
import { IntegrationPageContainer } from '../../../components/integrations/IntegrationsPageContainer'
import Error404Page from '../../404'
import ErrorPage from '../../_error'
import { getHeadMetatags } from '../../../src/utils/html.utils'

interface Props {
  categoryKey: string
}

function IntegrationCategoryPage(props: Props) {
  const { categoryKey } = props
  const { data, loading, error } = useGetIntegrationCategory({
    variables: {
      id: categoryKey,
    },
  })

  if (loading) {
    return <Loading />
  }
  if (error) {
    return <ErrorPage error={error} />
  }
  if (!data?.integrationCategory) {
    return <Error404Page /> // TODO soft 404
  }

  const category = data.integrationCategory

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
    categoryKey: getQueryParam(ctx, 'category').toLowerCase(),
  }
}

export default withApollo(IntegrationCategoryPage, { useLayout: false })
