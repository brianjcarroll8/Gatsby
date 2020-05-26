import React from "react"
import { getModule } from "gatsby"

export default function asComponent(data) {
  if (data != null) {
    const component = getModule(data.moduleId)
    return (...additionalArgs) =>
      React.createElement(component, { ...data.args, ...additionalArgs })
  } else {
    return () => null
  }
}
