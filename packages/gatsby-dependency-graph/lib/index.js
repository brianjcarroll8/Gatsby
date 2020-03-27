"use strict";

var _path = require("path");

var _readPages = require("./read-pages");

var _readDependencies = require("./read-dependencies");

var _scanForUnresolvedDependencies = require("./scan-for-unresolved-dependencies");

async function main() {
  const ROOT = (0, _path.join)(__dirname, "../../gdimension");
  const pages = await (0, _readPages.readGatsbyPages)((0, _path.join)(ROOT, "/src/pages"));
  let resolvedDependencies = new Set(); // Generate the graph for each page

  const gdraph = {
    root: ROOT,
    pages: new Map(),
    components: new Map()
  }; // read pages as a first input

  await Promise.all(pages.map(async page => {
    gdraph.pages.set((0, _path.join)(__dirname, page), (await (0, _readDependencies.readDependencies)(ROOT, (0, _path.join)("/src/pages", page))));
  })); // then start looping through dependencies to resolve the entire tree

  async function runDependencyResolution() {
    const deps = (0, _scanForUnresolvedDependencies.findUnresolvedDependencies)(gdraph, resolvedDependencies);

    if (deps.length === 0) {
      return;
    }

    for (let index = 0; index < deps.length; index++) {
      const node = deps[index];

      for (let index = 0; index < node.dependencies.length; index++) {
        const componentPath = node.dependencies[index];
        const parts = componentPath.split(ROOT); // Mark the node as dependencies resolved so we don't hit this again.
        // maybe we should just delete

        gdraph.components.set(componentPath, {
          componentPath,
          ...(await (0, _readDependencies.readDependencies)(ROOT, parts[1]))
        });
        resolvedDependencies.add(node.componentPath);
      }
    }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve(runDependencyResolution());
      }, 0);
    });
  }

  await runDependencyResolution();
  console.log(resolvedDependencies);
}

main();