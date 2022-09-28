import { Tabs } from 'antd'
import { useState } from 'react'
import { Integration, IntegrationTrigger } from '../../../../graphql'
import { SelectPopularTrigger } from '../popular-triggers/SelectPopularTrigger'
import { SelectIntegration } from './SelectIntegration'

interface Props {
  onIntegrationSelect: (integration: Integration) => any
  onTriggerSelected: (trigger: IntegrationTrigger) => any
  onCredentialsSelected: (id: string) => any
  onSubmitTriggerInputs: (
    inputs: Record<string, any>,
    integrationTrigger: IntegrationTrigger,
    credentialsID?: string,
  ) => Promise<any>
}

export const SelectTrigger = ({
  onIntegrationSelect,
  onTriggerSelected,
  onCredentialsSelected,
  onSubmitTriggerInputs,
}: Props) => {
  const [activeKey, setActiveKey] = useState('0')

  return (
    <>
      <Tabs
        defaultActiveKey="0"
        activeKey={activeKey}
        onChange={setActiveKey}
        centered
        items={[
          {
            label: `Popular Triggers`,
            key: '0',
            children: (
              <SelectPopularTrigger
                onTriggerSelected={onTriggerSelected}
                onCredentialsSelected={onCredentialsSelected}
                onSubmitTriggerInputs={onSubmitTriggerInputs}
                onViewAllTriggersClick={() => setActiveKey('1')}
              />
            ),
          },
          {
            label: `All Triggers`,
            key: '1',
            children: <SelectIntegration onIntegrationSelect={onIntegrationSelect} nodeType="trigger" hidePopular />,
          },
        ]}
      />
    </>
  )
}
