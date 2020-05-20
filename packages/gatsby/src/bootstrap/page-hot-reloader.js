const { emitter } = require(`../redux`)
const apiRunnerNode = require(`../utils/api-runner-node`)
import { createPages } from "../utils/create-pages"

let pagesDirty = false
let graphql

const runCreatePages = async () => {
  pagesDirty = false

  createPages(graphql, `createPages`)

  emitter.emit(`CREATE_PAGE_END`)
}

module.exports = graphqlRunner => {
  graphql = graphqlRunner
  emitter.on(`CREATE_NODE`, action => {
    if (action.payload.internal.type !== `SitePage`) {
      pagesDirty = true
    }
  })
  emitter.on(`DELETE_NODE`, action => {
    if (action.payload.internal.type !== `SitePage`) {
      pagesDirty = true
      // Make a fake API call to trigger `API_RUNNING_QUEUE_EMPTY` being called.
      // We don't want to call runCreatePages here as there might be work in
      // progress. So this is a safe way to make sure runCreatePages gets called
      // at a safe time.
      apiRunnerNode(`FAKE_API_CALL`)
    }
  })

  emitter.on(`API_RUNNING_QUEUE_EMPTY`, () => {
    if (pagesDirty) {
      runCreatePages()
    }
  })
}
