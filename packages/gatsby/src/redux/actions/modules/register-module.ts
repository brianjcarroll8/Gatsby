import { IRegisterModuleAction } from "../../types"
import { generateComponentChunkName } from "../../../utils/js-chunk-names"

export const generateModuleId = ({
  source,
  type = `default`,
  importName,
}): string =>
  `${generateComponentChunkName(source, `module`)}-${type}-${importName || ``}`

type ReturnType = (dispatch: any) => string

export const registerModule = (
  {
    moduleID,
    source,
    importName,
    type = `default`,
  }: {
    moduleID?: string
    source: string
    type: string
    importName?: string
  },
  plugin = ``
): ReturnType => {
  const _moduleID = moduleID || generateModuleId({ source, type, importName })

  return dispatch => {
    const action: IRegisterModuleAction = {
      type: `REGISTER_MODULE`,
      plugin,
      payload: {
        moduleID: _moduleID,
        source,
        type,
        importName,
      },
    }
    dispatch(action)
    return _moduleID
  }
}
