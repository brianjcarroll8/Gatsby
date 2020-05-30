import { IRegisterModuleAction } from "../../types"
import { generateComponentChunkName } from "../../../utils/js-chunk-names"
import { slash } from "gatsby-core-utils"

export const generateModuleId = ({
  source,
  type = `default`,
  importName,
}): string =>
  `${generateComponentChunkName(source, `module`)}-${type}-${importName || ``}`

type ReturnType = (dispatch: (IRegisterModuleAction) => void) => string

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
  source = slash(source)
  const _moduleID = moduleID || generateModuleId({ source, type, importName })

  return dispatch => {
    const action = {
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
