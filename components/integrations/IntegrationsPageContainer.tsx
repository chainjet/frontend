import { Card } from 'antd'
import { useRouter } from 'next/router'
import React from 'react'
import { Integration, IntegrationCategory } from '../../graphql'
import { LandingFooter } from '../landing/LandingFooter'
import { LandingHeader } from '../landing/LandingHeader'
import { SelectIntegration } from '../workflow-nodes/drawer/steps/SelectIntegration'

interface Props {
  category?: IntegrationCategory
}

export function IntegrationPageContainer (props: Props) {
  const { category } = props
  const router = useRouter()

  const handleCategoryChange = async (selectedCategory: IntegrationCategory | null) => {
    if (selectedCategory) {
      await router.push('/integrations/category/[category]', `/integrations/category/${selectedCategory?.id}`, { shallow: true })
    } else {
      await router.push('/integrations', undefined, { shallow: true })
    }
  }

  return (
    <>
      <LandingHeader/>
        <Card>
            <SelectIntegration initialCategory={category}
                               onCategoryChange={handleCategoryChange}
                               useIntegrationLink={integration => `/integrations/${integration.key}`}
                               useCategoryLink={
                                 category => category ? `/integrations/category/${category.id}` : '/integrations'
                               }/>
        </Card>
        <LandingFooter/>
    </>
  )
}
