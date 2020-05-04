import { ActionsUnion } from "../types"

interface DependencyModule {
  moduleID: string
  source: string
  type: string
  importName?: string
  paths: string[]
}

export const modulesReducer = (
  state = new Map<string, DependencyModule>(),
  action: ActionsUnion
) => {
  switch (action.type) {
    case `REGISTER_MODULE`: {
      state.set(action.payload.moduleID, { ...action.payload, paths: [] })

      return state
    }
    // case `CREATE_COMPONENT_MODULE_DEPENDENCY`: {
    //   return state
    // }
    // case `DELETE_COMPONENTS_DEPENDENCIES`: {
    //   const { paths } = action.payload

    //   return state
    // }
  }
  return state
}
