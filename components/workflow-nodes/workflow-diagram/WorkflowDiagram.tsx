import { CanvasWidget, InputType } from '@projectstorm/react-canvas-core'
import createEngine, { DagreEngine, DefaultLinkModel, DiagramModel } from '@projectstorm/react-diagrams'
import { DiagramEngine, NodeModel } from '@projectstorm/react-diagrams-core'
import { KeyboardEvent, useEffect, useState } from 'react'
import { Workflow, WorkflowAction, WorkflowTrigger } from '../../../graphql'
import { WorkflowNode } from '../../../src/typings/Workflow'
import { getActionAncestryList } from '../../../src/utils/workflow-action.utils'
import { getIntegrationNodeFromWorkflowNode } from '../../../src/utils/workflow.utils'
import { BlockPageScroll } from '../../utils/BlockPageScroll'
import { CreateWorkflowActionDrawer } from '../drawer/CreateWorkflowActionDrawer'
import { CreateWorkflowTriggerDrawer } from '../drawer/CreateWorkflowTriggerDrawer'
import { UpdateWorkflowActionDrawer } from '../drawer/UpdateWorkflowActionDrawer'
import { UpdateWorkflowTriggerDrawer } from '../drawer/UpdateWorkflowTriggerDrawer'
import { DeleteWorkflowActionModal } from '../modals/DeleteWorkflowActionModal'
import { DeleteWorkflowTriggerModal } from '../modals/DeleteWorkflowTriggerModal'
import { AddTriggerActionNodeFactory } from './add-trigger-action-node/AddTriggerActionNodeFactory'
import { AddTriggerActionNodeModel } from './add-trigger-action-node/AddTriggerActionNodeModel'
import { DecisionNodeFactory } from './decision-node/DecisionNodeFactory'
import { DecisionNodeModel } from './decision-node/DecisionNodeModel'
import { DiagramNodeFactory } from './diagram-node/DiagramNodeFactory'
import { DiagramNodeModel } from './diagram-node/DiagramNodeModel'
require('./WorkflowDiagram.less')

interface WorkflowDiagramProps {
  workflow: Workflow
  workflowTrigger?: WorkflowTrigger | null
  workflowActions: WorkflowAction[]
  readonly?: boolean
  onCreateWorkflowTrigger: (workflowTrigger: WorkflowTrigger) => void
  onUpdateWorkflowTrigger: (workflowTrigger: WorkflowTrigger) => void
  onDeleteWorkflowTrigger: (id: string) => void
  onCreateWorkflowAction: (workflowAction: WorkflowAction) => void
  onUpdateWorkflowAction: (workflowAction: WorkflowAction) => void
  onDeleteWorkflowAction: (id: string) => void
}

// Fragments are defined on WorkflowDiagramFragments because react-diagram modules can't be directly imported with ssr

const WorkflowDiagram = ({
  workflow,
  workflowTrigger,
  workflowActions,
  readonly,
  onCreateWorkflowTrigger,
  onUpdateWorkflowTrigger,
  onDeleteWorkflowTrigger,
  onCreateWorkflowAction,
  onUpdateWorkflowAction,
  onDeleteWorkflowAction,
}: WorkflowDiagramProps) => {
  const [diagramEngine, setDiagramEngine] = useState<DiagramEngine>()

  const [creatingTrigger, setCreatingTrigger] = useState<boolean>(false)
  const [updatingTrigger, setUpdatingTrigger] = useState<WorkflowTrigger | undefined>()
  const [deletingTrigger, setDeletingTrigger] = useState<WorkflowTrigger | undefined>()
  const [creatingAction, setCreatingAction] = useState<{ node?: WorkflowNode | boolean; condition?: string }>({})
  const [updatingAction, setUpdatingAction] = useState<WorkflowAction | undefined>()
  const [deletingAction, setDeletingAction] = useState<WorkflowAction | undefined>()
  const [testError, setTestError] = useState<Error | undefined>()

  const handleCreateTrigger = (workflowTrigger: WorkflowTrigger) => {
    onCreateWorkflowTrigger(workflowTrigger)
    setCreatingTrigger(false)
  }

  const handleUpdateTrigger = (workflowTrigger: WorkflowTrigger) => {
    onUpdateWorkflowTrigger(workflowTrigger)
    setUpdatingTrigger(undefined)
  }

  const handleDeleteTrigger = (id: string) => {
    onDeleteWorkflowTrigger(id)
    setDeletingTrigger(undefined)
  }

  const handleCreateAction = (workflowAction: WorkflowAction) => {
    onCreateWorkflowAction(workflowAction)
    setCreatingAction({})
  }

  const handleTestActionError = (workflowAction: WorkflowAction, error: Error) => {
    setTestError(error)
    setUpdatingAction(workflowAction)
    setCreatingAction({})
  }

  const handleUpdateAction = (workflowAction: WorkflowAction) => {
    onUpdateWorkflowAction(workflowAction)
    setUpdatingAction(undefined)
  }

  const handleDeleteAction = (id: string) => {
    onDeleteWorkflowAction(id)
    setDeletingAction(undefined)
  }

  const getParentActionIds = (node: WorkflowNode | boolean | undefined, includeAction: boolean) => {
    if (node && typeof node === 'object' && (node as WorkflowAction)?.integrationAction) {
      const parentAction = node as WorkflowAction
      const ancestry = getActionAncestryList(workflowActions, parentAction).map((action) => action.id)
      if (includeAction) {
        return [...ancestry, parentAction.id]
      }
      return ancestry
    }
    return []
  }

  const getNextAction = (node: WorkflowNode | boolean | undefined, workflowActions: WorkflowAction[]) => {
    const parentActionIds = getParentActionIds(node, true)

    // action was added to the root of the workflow
    if (!parentActionIds.length && workflowActions.length) {
      return workflowActions.find((action) => action.isRootAction)?.id
    }

    if (!node || typeof node === 'boolean') {
      return
    }

    const nextActions = (creatingAction.node as WorkflowAction).nextActions
    if (!nextActions?.length) {
      return
    }

    const nextAction = nextActions.find((action) => !action.condition || action.condition === creatingAction.condition)
    return nextAction?.action?.id
  }

  useEffect(() => {
    let engine = diagramEngine

    // Engine should only be created once, otherwise canvas freezes
    if (!engine) {
      engine = createEngine({ registerDefaultDeleteItemsAction: false })

      // Register factories
      const factories = [new DiagramNodeFactory(), new DecisionNodeFactory(), new AddTriggerActionNodeFactory()]
      factories.forEach((factory) => engine?.getNodeFactories().registerFactory(factory))

      // Disable link points
      engine.setMaxNumberPointsPerLink(0)

      engine.registerListener({
        canvasReady: () => engine?.zoomToFit(),
      })

      fixEngineEventBus(engine)

      setDiagramEngine(engine)
    }

    const model = new DiagramModel()
    createWorkflowTree({
      model,
      workflow,
      workflowTrigger: workflowTrigger,
      workflowActions: workflowActions,
      readonly: !!readonly,
      onCreateTriggerClick: () => setCreatingTrigger(true),
      onUpdateTriggerClick: (trigger) => setUpdatingTrigger(trigger as WorkflowTrigger),
      onDeleteTriggerClick: (trigger) => setDeletingTrigger(trigger as WorkflowTrigger),
      onCreateActionClick: (node, condition) => setCreatingAction({ node: node ?? true, condition }),
      onUpdateActionClick: (action) => setUpdatingAction(action as WorkflowAction),
      onDeleteActionClick: (action) => setDeletingAction(action as WorkflowAction),
    })
    engine.setModel(model)

    // Redistribute nodes
    // https://github.com/dagrejs/dagre/wiki#configuring-the-layout
    const dagreEngine = new DagreEngine({
      graph: {
        marginx: 50, // TODO set 0 on small screens
        marginy: 50,
        nodesep: 300,
        ranksep: 200,
        // ranker: 'longest-path',
      },
      includeLinks: true,
    })
    dagreEngine.redistribute(model)
  }, [diagramEngine, workflow, workflowTrigger, workflowActions, readonly])

  if (!diagramEngine) {
    return <></>
  }

  return (
    <>
      <BlockPageScroll>
        <CanvasWidget className="flow-canvas" engine={diagramEngine} />
      </BlockPageScroll>

      {creatingTrigger && (
        <CreateWorkflowTriggerDrawer
          workflowId={workflow.id}
          visible={true}
          onCreateWorkflowTrigger={handleCreateTrigger}
          onCancel={() => setCreatingTrigger(false)}
        />
      )}
      {updatingTrigger && (
        <UpdateWorkflowTriggerDrawer
          workflowTriggerId={updatingTrigger.id}
          visible={true}
          readonly={!!readonly}
          onUpdateWorkflowTrigger={handleUpdateTrigger}
          onCancel={() => setUpdatingTrigger(undefined)}
        />
      )}
      {deletingTrigger && (
        <DeleteWorkflowTriggerModal
          workflowTriggerId={deletingTrigger.id}
          workflowTriggerName={deletingTrigger.integrationTrigger.name}
          visible={true}
          onDeleteWorkflowTrigger={handleDeleteTrigger}
          onCancel={() => setDeletingTrigger(undefined)}
        />
      )}
      {creatingAction?.node && (
        <CreateWorkflowActionDrawer
          workflowId={workflow.id}
          workflowTriggerId={workflowTrigger?.id}
          parentActionIds={getParentActionIds(creatingAction.node, true)}
          previousActionCondition={creatingAction.condition}
          nextAction={getNextAction(creatingAction.node, workflowActions)}
          visible={true}
          onCreateWorkflowAction={handleCreateAction}
          onActionTestError={handleTestActionError}
          onCancel={() => setCreatingAction({})}
        />
      )}
      {updatingAction && (
        <UpdateWorkflowActionDrawer
          workflowActionId={updatingAction.id}
          workflowTriggerId={workflowTrigger?.id}
          parentActionIds={getParentActionIds(updatingAction, false)}
          visible={true}
          testError={testError}
          readonly={!!readonly}
          onUpdateWorkflowAction={handleUpdateAction}
          onCancel={() => setUpdatingAction(undefined)}
        />
      )}
      {deletingAction && (
        <DeleteWorkflowActionModal
          workflowActionId={deletingAction.id}
          workflowActionName={deletingAction.integrationAction.name}
          visible={true}
          onDeleteWorkflowAction={handleDeleteAction}
          onCancel={() => setDeletingAction(undefined)}
        />
      )}
    </>
  )
}

function addNode(
  model: DiagramModel,
  workflow: Workflow,
  workflowNode: WorkflowNode,
  isRootNode: boolean,
  readonly: boolean,
  onCreateClick: (node?: WorkflowNode, condition?: string) => void,
  onUpdateClick: (node: WorkflowNode) => void,
  onDeleteClick: (node: WorkflowNode) => void,
) {
  const ModelClass = getNodeModel(workflowNode)
  const node = new ModelClass({
    workflow,
    workflowNode,
    isRootNode,
    readonly,
    onCreateClick,
    onUpdateClick,
    onDeleteClick,
  })
  model.addNode(node)
  return node
}

function getNodeModel(workflowNode: WorkflowNode) {
  const integrationNode = getIntegrationNodeFromWorkflowNode(workflowNode)
  if (integrationNode.integration.key === 'logic' && integrationNode.key === 'decision') {
    return DecisionNodeModel
  }
  return DiagramNodeModel
}

function createEmptyWorkflowDiagram(
  model: DiagramModel,
  workflow: Workflow,
  onCreateTriggerClick: (node?: WorkflowNode) => void,
) {
  const node = new AddTriggerActionNodeModel({
    workflow,
    onCreateTriggerClick,
  })
  model.addNode(node)
}

interface CreateWorkflowTreeOpts {
  model: DiagramModel
  workflow: Workflow
  workflowTrigger?: WorkflowTrigger | null
  workflowActions: WorkflowAction[]
  readonly: boolean
  onCreateTriggerClick: (node?: WorkflowNode) => void
  onUpdateTriggerClick: (node: WorkflowNode) => void
  onDeleteTriggerClick: (node: WorkflowNode) => void
  onCreateActionClick: (node?: WorkflowNode, condition?: string) => void
  onUpdateActionClick: (node: WorkflowNode) => void
  onDeleteActionClick: (node: WorkflowNode) => void
}

function createWorkflowTree(options: CreateWorkflowTreeOpts) {
  if (!options.workflowTrigger && !options.workflowActions.length) {
    return createEmptyWorkflowDiagram(options.model, options.workflow, options.onCreateTriggerClick)
  }
  let triggerNode: NodeModel | undefined
  if (options.workflowTrigger) {
    triggerNode = addNode(
      options.model,
      options.workflow,
      options.workflowTrigger,
      true,
      options.readonly,
      options.onCreateActionClick,
      options.onUpdateTriggerClick,
      options.onDeleteTriggerClick,
    )
  }
  const rootActions = options.workflowActions.filter((action) => action.isRootAction)
  rootActions.forEach((rootAction) =>
    createActionNodes(
      options.model,
      options.workflow,
      options.workflowActions,
      rootAction,
      triggerNode,
      null,
      !!options.readonly,
      options.onCreateTriggerClick,
      options.onCreateActionClick,
      options.onUpdateActionClick,
      options.onDeleteActionClick,
    ),
  )
}

function createActionNodes(
  model: DiagramModel,
  workflow: Workflow,
  workflowActions: WorkflowAction[],
  rootAction: WorkflowAction,
  parentNode: NodeModel | undefined,
  parentCondition: string | null,
  readonly: boolean,
  onCreateTriggerClick: (node?: WorkflowNode) => void,
  onCreateActionClick: (node?: WorkflowNode, condition?: string) => void,
  onUpdateActionClick: (node: WorkflowNode) => void,
  onDeleteActionClick: (node: WorkflowNode) => void,
) {
  const node = addNode(
    model,
    workflow,
    rootAction,
    !parentNode,
    readonly,
    (node?: WorkflowNode, condition?: string) =>
      node ? onCreateActionClick(node, condition) : onCreateTriggerClick(node),
    onUpdateActionClick,
    onDeleteActionClick,
  )
  if (parentNode) {
    const portFrom = parentNode.getPort(parentCondition ?? 'out')
    const portTo = node.getPort('in')
    if (portFrom && portTo) {
      const link = new DefaultLinkModel({ curvyness: 10 })
      link.setSourcePort(portFrom)
      link.setTargetPort(portTo)
      if (parentCondition) {
        link.addLabel(parentCondition)
      }
      model.addLink(link)
    }
  }

  ;(rootAction.nextActions ?? [])
    .slice() // since array is frozen, we need a copy in order to sort it
    .sort((a) => {
      if (a.condition) {
        const aAlignment = node.getPort(a.condition)?.getOptions().alignment
        if (aAlignment === 'left') {
          return -1
        } else if (aAlignment === 'right') {
          return 1
        }
      }
      return 0
    })
    .forEach((nextAction) => {
      const action = workflowActions.find((action) => action.id === nextAction.action.id)
      if (action) {
        createActionNodes(
          model,
          workflow,
          workflowActions,
          action,
          node,
          nextAction.condition ?? null,
          readonly,
          onCreateTriggerClick,
          onCreateActionClick,
          onUpdateActionClick,
          onDeleteActionClick,
        )
      }
    })
}

/**
 * Event bus key up/down has issues when using forms in the drawer
 * Disable key actions and fix internal method
 */
function fixEngineEventBus(engine: DiagramEngine) {
  const eventBus = engine.getActionEventBus()
  // @ts-ignore
  Object.values(eventBus.actions)
    .filter((action) => ['key-up', 'key-down'].includes(action.options.type))
    .forEach((action) => eventBus.deregisterAction(action))

  eventBus.getActionsForEvent = (actionEvent) => {
    const { event } = actionEvent
    if (event.type === 'mousedown') {
      return eventBus.getActionsForType(InputType.MOUSE_DOWN)
    } else if (event.type === 'mouseup') {
      return eventBus.getActionsForType(InputType.MOUSE_UP)
    } else if (event.type === 'keydown') {
      // store the recorded key
      // @ts-ignore
      eventBus.keys[(event as KeyboardEvent).key?.toLowerCase() || 'Unidentified'] = true
      return eventBus.getActionsForType(InputType.KEY_DOWN)
    } else if (event.type === 'keyup') {
      // delete the recorded key
      // @ts-ignore
      delete eventBus.keys[(event as KeyboardEvent).key?.toLowerCase() || 'Unidentified']
      return eventBus.getActionsForType(InputType.KEY_UP)
    } else if (event.type === 'mousemove') {
      return eventBus.getActionsForType(InputType.MOUSE_MOVE)
    } else if (event.type === 'wheel') {
      return eventBus.getActionsForType(InputType.MOUSE_WHEEL)
    }
    return []
  }
}

export default WorkflowDiagram
