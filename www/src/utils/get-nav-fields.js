const fs = require(`fs-extra`)
const yaml = require(`js-yaml`)
const docLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/doc-links.yaml`)
)
const tutorialLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/tutorial-links.yaml`)
)
const contributingLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/contributing-links.yaml`)
)

const navLinks = {
  docs: docLinksData,
  tutorial: tutorialLinksData,
  contributing: contributingLinksData,
}

function isPathEquals(slug, link) {
  return slug === link
}

function flattenList(itemList) {
  return itemList.reduce((reducer, { items, ...rest }) => {
    reducer.push(rest)
    if (items) reducer.push(...flattenList(items))
    return reducer
  }, [])
}

function getHierarchy(slug, itemList) {
  for (let item of itemList) {
    // return an empty array if we are the item
    if (isPathEquals(slug, item.link)) {
      return [item]
    }
    if (item.items) {
      const subResult = getHierarchy(slug, item.items)
      if (subResult) {
        return subResult.concat([item])
      }
    }
  }
  return null
}

function getPrevAndNext(slug, itemList) {
  // TODO handle hashes
  const flattenedList = flattenList(itemList[0].items)
  const index = flattenedList.findIndex(item => isPathEquals(slug, item.link))
  if (index === -1) {
    return {}
  }
  return {
    prev: flattenedList[index - 1] && flattenedList[index - 1].link,
    next: flattenedList[index + 1] && flattenedList[index + 1].link,
  }
}

/**
 * Create fields representing related items to this article in the site navigation
 */
function getNavFields(slug, itemList) {
  //
  const section = slug.split("/")[1]
  if (!itemList) {
    itemList = navLinks[section]
  }
  const hierarchy = getHierarchy(slug, itemList)
  if (!hierarchy) {
    return {}
  }
  const [item, ...parentItems] = hierarchy

  // Treat the first item as a "top level link" representing the entire hierarchy
  const topLevelLink = itemList[0].items[0].link
  const parentItemLinks = parentItems.map(item => item.link ?? topLevelLink)
  const isTopLevel = slug === topLevelLink
  return {
    navTitle: item.title,
    breadcrumbTitle: item.breadcrumbTitle || item.title,
    parent: isTopLevel ? undefined : parentItemLinks[0],
    parents: isTopLevel ? [] : parentItemLinks,
    children: item.items?.map(item => item.link) ?? [],
    ...getPrevAndNext(slug, itemList),
  }
}

module.exports = {
  getNavFields,
}
