const fs = require(`fs-extra`)
const path = require(`path`)
const Joi = require(`@hapi/joi`)

const plugin = require(`./plugin`)

// TODO: Connection to shadowed file resource.
//       id: file? or theme name?
// Shadow file resource with filter (define own filter)
const create = async (ctx, id) => {
  const file = await plugin.read(ctx, id)

  return {
    ...file,
    shadowedFiles: [`shadowed-file/dope.js`],
    shadowableFiles: [`shadowable-file/neat.js`],
  }
}

const read = async (ctx, id) => {
  const file = await plugin.read(ctx, id)

  return {
    ...file,
    shadowedFiles: [`shadowed-file/dope.js`],
    shadowableFiles: [`shadowable-file/neat.js`],
  }
}

const destroy = plugin.destroy

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy

module.exports.all = async ({ root }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const src = await fs.readFile(configPath, `utf8`)
  const plugins = plugin.getPluginsFromConfig(src)

  // TODO: Consider mapping to read function
  return plugins.map(name => {
    return {
      id: name,
      name,
      shadowedFiles: [`shadowed-file/dope.js`],
      shadowableFiles: [`shadowable-file/neat.js`],
    }
  })
}

module.exports.validate = () => {
  return {
    name: Joi.string(),
    shadowedFiles: Joi.array().items(Joi.string()),
    shadowableFiles: Joi.array().items(Joi.string()),
  }
}

module.exports.plan = async ({ root }, { id, name }) => {
  const fullName = id || name
  const configPath = path.join(root, `gatsby-config.js`)
  const src = await fs.readFile(configPath, `utf8`)
  const newContents = plugin.addPluginToConfig(src, fullName)

  return {
    id: fullName,
    name,
    currentState: src,
    newState: newContents,
    describe: `Configure ${fullName}`,
  }
}
