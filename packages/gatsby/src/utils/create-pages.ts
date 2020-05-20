import apiRunnerNode from "./api-runner-node"
import reporter from "gatsby-cli/lib/reporter"
import { store } from "../redux"

import { boundActionCreators } from "../redux/actions"

const { deletePage, deleteComponentsDependencies } = boundActionCreators

export const createPages = async (graphql, traceId, parentSpan) => {
  const timestamp = Date.now()

  // Collect pages.
  let activity = reporter.activityTimer(`createPages`, { parentSpan })
  activity.start()
  await apiRunnerNode(
    `createPages`,
    {
      graphql,
      traceId,
      waitForCascadingActions: true,
    },
    { activity }
  )
  activity.end()

  // Delete pages that weren't updated when running createPages.
  Array.from(store.getState().pages.values()).forEach(page => {
    if (
      !page.isCreatedByStatefulCreatePages &&
      page.updatedAt < timestamp &&
      page.path !== `/404.html`
    ) {
      deleteComponentsDependencies([page.path])
      deletePage(page)

      // think about handling stale `page-data` here :thinking:
    }
  })

}