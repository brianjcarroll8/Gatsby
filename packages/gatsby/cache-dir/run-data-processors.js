import { getModule } from "./modules-provider"

export default function runDataProcessors({ data, dataProcessors }) {
  console.log(`page data processing`, dataProcessors, data)
  if (dataProcessors) {
    Object.keys(dataProcessors).forEach(key => {
      const modules = dataProcessors[key].map(moduleId => getModule(moduleId))
      console.log(`modules`, modules)
      runModulesOnPath(data, key.split(`.`), modules)
    })
  }
}

function runModulesOnPath(data, path, modules) {
  let curr = data
  while (path.length > 1 && curr) {
    if (Array.isArray(curr)) {
      curr.forEach(item => {
        runModulesOnPath(item, [...path], modules)
      })
      return
    } else {
      curr = curr[path.shift()]
    }
  }

  if (curr) {
    curr[path[0]] = modules.reduce(
      (acc, next) => next(acc, { getModule }),
      curr[path[0]]
    )
  }
}
