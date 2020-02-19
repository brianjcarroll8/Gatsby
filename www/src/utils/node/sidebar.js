const yaml = require(`js-yaml`)
const sections = [`doc`, `contributing`, `features`, `tutorial`]
const _ = require(`lodash`)

const createHash = link => {
  let index = -1
  if (link) index = link.indexOf(`#`)
  return index >= 0 ? link.substr(index + 1) : undefined
}

const extendItems = (items, pages, level = 0, parentTitle) => {
  return items.map(_item => {
    if (typeof _item === "string") {
      _item = { link: _item }
    }
    const item = {
      ..._item,
      hash: createHash(_item.link),
      parentTitle,
      level,
    }

    if (pages[item.link]) {
      const { title, navTitle, breadcrumbTitle, issue } = pages[
        item.link
      ].frontmatter

      if (issue) {
        item.stub = true
      }

      if (!item.title) {
        item.title = navTitle || title
        item.breadcrumbTitle = breadcrumbTitle || navTitle || title
      }
    }

    if (item.items) {
      item.items = extendItems(item.items, pages, item.level + 1, item.title)
    }
    return item
  })
}

const extendSidebarData = (item, pages) => {
  return {
    title: item[0].title,
    breadcrumbTitle: item[0].breadcrumbTitle,
    key: item[0].key,
    disableExpandAll: item[0].disableExpandAll,
    disableAccordions: item[0].disableAccordions,
    items: extendItems(item[0].items, pages),
  }
}

exports.createResolvers = ({ createResolvers, loadNodeContent }) => {
  createResolvers({
    Query: {
      test: {
        type: `JSON`,
        resolve: async (source, args, context, info) => {
          const result = await context.nodeModel.runQuery(
            {
              type: `MarkdownRemark`,
            },
            {
              connectionType: `MarkdownRemark`,
            }
          )
          return result
        },
      },
      sidebarItemList: {
        type: `JSON`,
        args: {
          section: {
            type: `String!`,
          },
        },
        resolve: async (source, args, context, info) => {
          if (!sections.includes(args.section)) {
            throw new Error(
              `Section must be one of ${sections
                .map(section => `"${section}"`)
                .join(`, `)}`
            )
          }

          const pages = await context.nodeModel.runQuery(
            {
              query: {
                filter: {
                  fields: {
                    section: {
                      in: [`docs`, `contributing`, `tutorial`],
                    },
                  },
                },
              },
              type: `Mdx`,
            },
            {
              connectionType: `Mdx`,
            }
          )

          const sidebarFileNode = await context.nodeModel.runQuery({
            query: {
              filter: {
                base: { eq: `${args.section}-links.yaml` },
              },
            },
            firstOnly: true,
            type: `File`,
          })

          const sidebarFileContent = await loadNodeContent(sidebarFileNode)
          const parsedSidebarContent = yaml.safeLoad(sidebarFileContent)

          const pagesByLocale = _.groupBy(pages, `fields.locale`)

          const itemListByLocale = {}
          Object.entries(pagesByLocale).forEach(([locale, pages]) => {
            const pagesMap = _.keyBy(pages, `fields.slug`)
            const itemList = extendSidebarData(parsedSidebarContent, pagesMap)
            itemListByLocale[locale] = itemList
          })

          return itemListByLocale
        },
      },
    },
  })
}
