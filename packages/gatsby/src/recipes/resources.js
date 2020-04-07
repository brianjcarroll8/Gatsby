const fileResource = require(`./providers/fs/file`)
const gatsbyPluginResource = require(`./providers/gatsby/plugin`)
const gatsbyThemeResource = require(`./providers/gatsby/theme`)
const gatsbyShadowFileResource = require(`./providers/gatsby/shadow-file`)
const npmPackageResource = require(`./providers/npm/package`)
const npmPackageScriptResource = require(`./providers/npm/script`)
const npmPackageJsonResource = require(`./providers/npm/package-json`)

const configResource = {
  create: () => {},
  read: () => {},
  update: () => {},
  destroy: () => {},
  plan: () => {},
}

const componentResourceMapping = {
  File: fileResource,
  GatsbyPlugin: gatsbyPluginResource,
  GatsbyTheme: gatsbyThemeResource,
  ShadowFile: gatsbyShadowFileResource,
  Config: configResource,
  NPMPackage: npmPackageResource,
  NPMScript: npmPackageScriptResource,
  NPMPackageJson: npmPackageJsonResource,
}

module.exports = componentResourceMapping
