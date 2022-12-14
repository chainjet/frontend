import { gql } from '@apollo/client'
import { Card, Typography } from 'antd'
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { Loading } from '../../components/common/RequestStates/Loading'
import { IntegrationBanner } from '../../components/integrations/IntegrationBanner'
import { LandingFooter } from '../../components/landing/LandingFooter'
import { LandingHeader } from '../../components/landing/LandingHeader'
import { OperationList } from '../../components/operations/OperationList'
import { RecommendedTemplates } from '../../components/templates/RecommendedTemplates'
import { withApollo } from '../../src/apollo'
import { useGetIntegrations } from '../../src/services/IntegrationHooks'
import { getHeadMetatags } from '../../src/utils/html.utils'
import { getQueryParam } from '../../src/utils/nextUtils'
import Error404Page from '../404'
import ErrorPage from '../_error'

interface Props {
  integrationKey: string
}

const integrationFragment = gql`
  fragment IntegrationPage on Integration {
    id
    ...IntegrationBanner_Integration
    triggers(paging: { first: 360 }) {
      edges {
        node {
          id
          ...OperationList_IntegrationTrigger
        }
      }
    }
    actions(paging: { first: 360 }) {
      edges {
        node {
          id
          ...OperationList_IntegrationAction
        }
      }
    }
  }
  ${IntegrationBanner.fragments.Integration}
  ${OperationList.fragments.IntegrationTrigger}
  ${OperationList.fragments.IntegrationAction}
`

function IntegrationPage({ integrationKey }: Props) {
  const [hasTemplates, setHasTemplates] = useState(false)
  const { data, loading, error } = useGetIntegrations(integrationFragment, {
    variables: {
      filter: {
        key: { eq: integrationKey },
      },
    },
  })
  const breakpoint = useBreakpoint()

  if (loading) {
    return <Loading />
  }
  if (error) {
    return <ErrorPage error={error} />
  }
  if (!data?.integrations.edges?.length) {
    return <Error404Page /> // TODO soft 404
  }

  const integration = data.integrations.edges[0].node
  const shortName = integration.name.replace(/\([^)]*\)/, '').trim()

  const triggers = (integration.triggers?.edges.map((edge) => edge.node) ?? [])
    // Sort instant triggers first, then by name
    .sort((a, b) => {
      if (a.instant && b.instant) {
        if (a.name > b.name) {
          return 1
        }
        return -1
      }
      if (a.instant) {
        return -1
      }
      if (b.instant) {
        return 1
      }
      if (a.name > b.name) {
        return 1
      }
      return -1
    })

  const actions = (integration.actions?.edges.map((edge) => edge.node) ?? [])
    // Sort actions by name
    .sort((a, b) => {
      if (a.name > b.name) {
        return 1
      }
      return -1
    })

  return (
    <>
      <Head>
        {getHeadMetatags({
          path: `/integrations/${integration.key}`,
          title: `Integrate ${integration.name} with web2 and web3 of apps`,
          description:
            `ChainJet allows you to connect ${shortName} with web3 dapps and web2 services, ` +
            `so you can automate your work. No code required.`,
          image: integration.logo,
        })}
      </Head>
      <LandingHeader />

      <div className="container px-0 mx-auto mt-10 lg:px-24">
        <IntegrationBanner integration={integration} />

        <div className="w-full mt-12">
          {hasTemplates && (
            <div className="mb-8 text-center">
              <span className="text-xl font-bold">Popular workflows using {integration.name}</span>
            </div>
          )}
          <div className="w-full">
            <RecommendedTemplates
              integrationKey={integration.key}
              onTemplatesLoaded={(templates) => templates.length && setHasTemplates(true)}
            />
          </div>
        </div>

        {!!triggers.length && (
          <div className="mt-8">
            <Card style={{ padding: breakpoint.xs ? '0' : '16px 128px' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Typography.Title level={3}>Triggers</Typography.Title>
              </div>
              <OperationList integration={integration} operations={triggers} columns={breakpoint.xs ? 1 : 2} />
            </Card>
          </div>
        )}
        {!!actions.length && (
          <div className="mt-8 mb-8">
            <Card style={{ padding: breakpoint.xs ? '0' : '16px 128px' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Typography.Title level={3}>Actions</Typography.Title>
              </div>
              <OperationList integration={integration} operations={actions} columns={breakpoint.xs ? 1 : 2} />
            </Card>
          </div>
        )}
      </div>

      <LandingFooter />
    </>
  )
}

IntegrationPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  return {
    integrationKey: getQueryParam(ctx, 'integration').toLowerCase(),
  }
}

export default withApollo(IntegrationPage, { useLayout: false })
