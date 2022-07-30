import { WorkflowAction, WorkflowNextAction } from '../../../graphql'
import { getActionAncestryList } from '../workflow-action.utils'

describe('Workflow Action Utils', () => {
  describe('getActionAncestryList', () => {
    const createNextAction = (id: number | string): WorkflowNextAction =>
      ({ action: { id: id.toString() } } as WorkflowNextAction)

    const workflowActions: WorkflowAction[] = [
      {
        id: '1',
        isRootAction: true,
        nextActions: [3].map(id => createNextAction(id)),
      },
      {
        id: '2',
        isRootAction: true,
        nextActions: [4, 5].map(id => createNextAction(id)),
      },
      {
        id: '3',
        nextActions: [6, 7].map(id => createNextAction(id)),
      },
      {
        id: '4',
      },
      {
        id: '5',
      },
      {
        id: '6',
      },
      {
        id: '7',
        nextActions: [8].map(id => createNextAction(id)),
      },
      {
        id: '8'
      }
    ] as WorkflowAction[]

    it('should return all the parents for a leaf node', async () => {
      const target = workflowActions.find(action => action.id === '8')!
      expect(getActionAncestryList(workflowActions, target).map(action => action.id)).toEqual(['1', '3', '7'])
    })

    it('should return all parents for a node with siblings', async () => {
      const target = workflowActions.find(action => action.id === '7')!
      expect(getActionAncestryList(workflowActions, target).map(action => action.id)).toEqual(['1', '3'])
    })

    it('should return an empty array for a root node', async () => {
      const target = workflowActions.find(action => action.id === '2')!
      expect(getActionAncestryList(workflowActions, target).map(action => action.id)).toEqual([])
    })
  })
})
