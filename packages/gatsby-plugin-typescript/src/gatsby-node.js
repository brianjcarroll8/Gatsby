const fs = require(`fs-extra`)
const path = require(`path`)
const ForkTsCheckerWebpackPlugin = require(`fork-ts-checker-webpack-plugin`)

const resolvableExtensions = () => [`.ts`, `.tsx`]

function onCreateBabelConfig({ actions }, options) {
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-typescript`),
    options,
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-optional-chaining`),
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-nullish-coalescing-operator`),
  })
  actions.setBabelPlugin({
    name: require.resolve(`@babel/plugin-proposal-numeric-separator`),
  })
}

function onCreateWebpackConfig({ actions, loaders, stage, reporter, ...rest }) {
  // If we are building a production build we do not want to asynchroneously check types
  const root = rest.getConfig().context
  const async = stage === `build-javascript` ? false : true
  const jsLoader = loaders.js()
  const hasTSConfig = fs.existsSync(path.join(root, `tsconfig.json`))

  if (!jsLoader) {
    return
  }

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: jsLoader,
        },
      ],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        // Load the users provided tsconfig.json if it exists,
        // otherwise we'll provide our own to make the basics work
        tsconfig: hasTSConfig
          ? path.join(root, `tsconfig.json`)
          : require.resolve(`./tsconfig.json`),
        async,
        logger: reporter,
        formatter: `codeframe`,
        // typescript: this should try to load the users provided one if it exists first
        // tsconfig: this should try to load the users provided one if it exists first
      }),
    ],
  })
}

exports.resolvableExtensions = resolvableExtensions
exports.onCreateBabelConfig = onCreateBabelConfig
exports.onCreateWebpackConfig = onCreateWebpackConfig
