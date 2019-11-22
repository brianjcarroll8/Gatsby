/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict"

const fs = require(`fs`)
const path = require(`path`)

const execa = require(`execa`)

const PACKAGES_DIR = path.resolve(__dirname, `../packages`)

const packages = fs
  .readdirSync(PACKAGES_DIR)
  .map(file => path.resolve(PACKAGES_DIR, file))
  .filter(f => fs.lstatSync(path.resolve(f)).isDirectory())

const packagesWithTs = packages.filter(p =>
  fs.existsSync(path.resolve(p, `tsconfig.json`))
)

const args = [
  `--max-old-space-size=4096`,
  path.resolve(
    require.resolve(`typescript/package.json`),
    `..`,
    require(`typescript/package.json`).bin.tsc
  ),
  `-p`,
  ...packagesWithTs,
  ...process.argv.slice(2),
  `--noEmit`,
]

try {
  execa.sync(`node`, args, { stdio: `inherit` })
  console.log(`TypeScript Check: Success`)
} catch (e) {
  process.exitCode = 1
}
