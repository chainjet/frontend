import { Avatar, Button, Card, Select, Space } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { BulkActionsFreePlanModal } from '../../components/bulkactions/BulkActionsFreePlanModal'
import { PageWrapper } from '../../components/common/PageLayout/PageWrapper'
import { OperationsUsed } from '../../components/users/OperationsUsed'
import { withApollo } from '../../src/apollo'
import { BulkActionItem, bulkActions, bulkDataSources } from '../../src/constants/bulk-action-items'
import { useRedirectGuests, useViewer } from '../../src/services/UserHooks'

const { Option } = Select

function CreateBulkActionPage() {
  const { viewer } = useViewer()
  const { signer } = useRedirectGuests()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [selectedDataSource, setSelectedDataSource] = useState<BulkActionItem | null>(null)
  const [selectedAction, setSelectedAction] = useState<BulkActionItem | null>(null)
  const [openBulkActionsFreePlanModal, setOpenBulkActionsFreePlanModal] = useState(false)

  if (!signer || !viewer) {
    return <></>
  }

  const handleNextClick = async () => {
    // the button should be disabled if data source or action was not selected
    if (!selectedDataSource || !selectedAction) {
      return
    }

    // if bulk action is already open, means the user is continuing with the free plan
    if (!openBulkActionsFreePlanModal) {
      if (['free', 'early'].includes(viewer.plan)) {
        setOpenBulkActionsFreePlanModal(true)
        return
      }
    } else {
      setOpenBulkActionsFreePlanModal(false)
    }

    setLoading(true)
    const sourceKey = `${selectedDataSource.integrationKey}:${selectedDataSource.operationKey}`
    const actionKey = `${selectedAction.integrationKey}:${selectedAction.operationKey}`
    await router.push(`/create/bulkaction/setup?source=${sourceKey}&action=${actionKey}`)
  }

  const handleSelectDataSource = (value: string) => {
    const dataSource = bulkDataSources.find((dataSource) => dataSource.operationKey === value)
    if (dataSource) {
      setSelectedDataSource(dataSource)
    }
  }

  const handleSelectAction = (value: string) => {
    const action = bulkActions.find((action) => action.operationKey === value)
    if (action) {
      setSelectedAction(action)
    }
  }

  return (
    <>
      <Head>
        <title>Create a Bulk Action</title>
      </Head>
      <PageWrapper title="Create a Bulk Action" extra={<OperationsUsed />}>
        <div className="container px-0 mx-auto lg:px-24">
          <Card className="w-full flex justify-center">
            <div className="w-full md:w-fit gap-4 my-8">
              <div className="text-center text-2xl font-bold mb-8">Select Data Source and Action</div>
              <div className="text-center text-lg mb-12">
                To create a Bulk Action, select a data source and an action. The action will be executed for all items
                in the data source.
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <Card>
                    <div className="text-center text-xl font-bold mb-4">Select Data Source</div>
                    <div className="text-center mb-8">What data to use.</div>
                    <div className="text-center font-bold">Select a Data Source</div>
                    <div className="text-center">
                      <Select style={{ width: 240 }} placeholder="Choose data source" onChange={handleSelectDataSource}>
                        {bulkDataSources.map((dataSource) => (
                          <Option key={dataSource.operationKey} value={dataSource.operationKey}>
                            <Space>
                              <Avatar
                                shape="square"
                                size={20}
                                src={dataSource.icon}
                                alt={`${dataSource.name} icon`}
                                className="card-avatar"
                              />
                              {dataSource.name}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Card>
                </div>
                <div>
                  <Card>
                    <div className="text-center text-xl font-bold mb-4">Select Action</div>
                    <div className="text-center mb-8">What action to do.</div>
                    <div className="text-center font-bold">Select a Action</div>
                    <div className="text-center">
                      <Select style={{ width: 240 }} placeholder="Choose action" onChange={handleSelectAction}>
                        {bulkActions.map((action) => (
                          <Option key={action.operationKey} value={action.operationKey}>
                            <Space>
                              <Avatar
                                shape="square"
                                size={20}
                                src={action.icon}
                                alt={`${action.name} icon`}
                                className="card-avatar"
                              />
                              {action.name}
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="text-center mt-8">
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleNextClick}
                  disabled={!selectedDataSource || !selectedAction}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageWrapper>
      {openBulkActionsFreePlanModal && (
        <BulkActionsFreePlanModal
          onContinue={() => handleNextClick()}
          onCancel={() => setOpenBulkActionsFreePlanModal(false)}
        />
      )}
    </>
  )
}

export default withApollo(CreateBulkActionPage)
