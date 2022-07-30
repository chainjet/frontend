import { gql } from '@apollo/client';
import { Button, Card, Typography } from 'antd';
import React from 'react';
import { IntegrationTrigger, WorkflowTrigger } from '../../../../graphql';
import { useGetIntegrationTriggerById } from '../../../../src/services/IntegrationTriggerHooks';
import { Loading } from '../../../common/RequestStates/Loading';
import { RequestError } from '../../../common/RequestStates/RequestError';

interface Props {
  integrationTrigger: IntegrationTrigger
  workflowTrigger: WorkflowTrigger
  onClose: () => void
}

const integrationTriggerFragment = gql`
  fragment CompleteHookTrigger on IntegrationTrigger {
    id
    hookInstructions
  }
`

export function CompleteHookTrigger (props: Props) {
  const { integrationTrigger, workflowTrigger, onClose } = props
  const {data, loading, error} = useGetIntegrationTriggerById(integrationTriggerFragment, {
    variables: {
      id: integrationTrigger.id
    }
  })

  if (loading) {
    return <Loading />
  }
  if (error) {
    return <RequestError error={error}/>
  }

  return (
    <>
      <Card title="Webhook URL">
        {process.env.ENDPOINT}/hooks/{workflowTrigger.hookId}
      </Card>
      <div style={{ marginTop: 12 }}>
        <Typography.Text type="secondary">{data?.integrationTrigger.hookInstructions}</Typography.Text>
      </div>
      <div>
        <Button type="primary" onClick={() => onClose()} style={{ marginTop: 24 }}>Done</Button>
      </div>
    </>
  )
}
