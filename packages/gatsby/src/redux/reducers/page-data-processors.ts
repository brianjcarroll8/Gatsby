import { IGatsbyState, ActionsUnion } from "../types"

export function pageDataProcessorsReducer(
  state: IGatsbyState["pageDataProcessors"] = new Map(),
  action: ActionsUnion
): IGatsbyState["pageDataProcessors"] {
  switch (action.type) {
    case `DELETE_CACHE`: {
      return new Map()
    }

    case `ADD_PAGE_DATA_PROCESSOR`: {
      let processorMap = state.get(action.payload.queryId)
      if (!processorMap) {
        processorMap = new Map()
        state.set(action.payload.queryId, processorMap)
      }

      let processorsByPath = processorMap.get(action.payload.path)
      if (!processorsByPath) {
        processorsByPath = new Set()
        processorMap.set(action.payload.path, processorsByPath)
      }
      processorsByPath.add(action.payload.moduleId)
      return state
    }
  }

  return state
}
