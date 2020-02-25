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

function addSlash(path) {
  return path[path.length - 1] === "/" ? path : path + "/"
}

const docLinks = {
  docs: docLinksData,
  tutorial: tutorialLinksData,
  contributing: contributingLinksData,
}

function isPathEquals(slug, link) {
  return slug === addSlash(link)
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
    prev: flattenedList[index - 1] && addSlash(flattenedList[index - 1].link),
    next: flattenedList[index + 1] && addSlash(flattenedList[index + 1].link),
  }
}

/**
 * Create fields representing related items to this article in the site navigation
 */
function getNavFields(slug) {
  //
  const section = slug.split("/")[1]
  const itemList = docLinks[section]
  if (!itemList) {
    return {}
  }
  const hierarchy = getHierarchy(slug, itemList[0].items)
  if (!hierarchy) {
    return {}
  }
  const [item, ...parentItems] = hierarchy
  return {
    navTitle: item.title,
    breadcrumbTitle: item.breadcrumbTitle || item.title,
    parents: parentItems ? parentItems.map(item => addSlash(item.link)) : [],
    items: item.items.map(item => addSlash(item.link)) || [],
    ...getPrevAndNext(slug, itemList),
  }
}

module.exports = {
  getNavFields,
}
