import { apiRunner, apiRunnerAsync } from "./api-runner-browser"
import React from "react"
import ReactDOM from "react-dom"
import Root from "./root"
import asyncRequires from "./async-requires"
import matchPaths from "./match-paths.json"
import emitter from "./emitter"
import { setLoader, ProdLoader, publicLoader } from "./loader"
import domReady from "@mikaelkristiansson/domready"
import socketIo from "./socketIo"

const loader = new ProdLoader(asyncRequires, matchPaths)
setLoader(loader)
loader.setApiRunner(apiRunner)

globalThis.asyncRequires = asyncRequires
globalThis.___emitter = emitter
globalThis.___loader = publicLoader

apiRunnerAsync(`onClientEntry`).then(() => {
  socketIo()
  // Let plugins register a service worker. The plugin just needs
  // to return true.
  console.log(`helllooo`)
  if (
    apiRunner(`registerServiceWorker`).length > 0 &&
    process.env.NODE_ENV === `production`
  ) {
    require(`./register-service-worker`)
  }

  const WrappedRoot = apiRunner(
    `wrapRootElement`,
    { element: <Root /> },
    <Root />,
    ({ result }) => {
      return { element: result }
    }
  ).pop()

  const NewRoot = () => WrappedRoot

  const renderer = apiRunner(
    `replaceHydrateFunction`,
    undefined,
    ReactDOM.hydrate
  )[0]

  Promise.all([
    loader.loadPage(`/dev-404-page/`),
    loader.loadPage(`/404.html`),
    loader.loadPage(window.location.pathname),
  ]).then(() => {
    domReady(() => {
      renderer(
        <NewRoot />,
        typeof window !== `undefined`
          ? document.getElementById(`___gatsby`)
          : void 0,
        () => {
          apiRunner(`onInitialClientRender`)
        }
      )
    })
  })
})
