import React, { useEffect, useRef, useState, useTransition } from "react"
import loader from "./loader"

function EnsureResources(props) {
  const [location, setLocation] = useState({ ...props.location })
  const initialPageResources = useRef(() =>
    loader.loadPageSync(location.pathname)
  )
  const [pageResources, setPageResources] = useState(
    initialPageResources.current
  )
  const [startTransition, isPending] = useTransition()

  useEffect(() => {
    if (location.href !== props.location.href) {
      const pageResources = loader.loadPageSync(props.location.pathname)
      setPageResources(pageResources)
    }

    setLocation({ ...props.location })
  }, [props.location])

  useEffect(() => {
    if (pageResources) return

    startTransition(() => {
      loader.loadPage(location.pathname).then(pageResources => {
        if (pageResources && pageResources.status !== `error`) {
          console.log("updates???")
          setPageResources(pageResources)
          setLocation({ ...window.location })
        } else {
          window.history.replaceState({}, ``, location.href)
          window.location = location.pathname
        }
      })
    })
  }, [pageResources])

  return props.children({ location, pageResources })
}

export default React.memo(EnsureResources)
