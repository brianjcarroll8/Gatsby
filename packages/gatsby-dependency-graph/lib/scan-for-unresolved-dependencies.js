"use strict";

let pagesAreScanned = false;

exports.findUnresolvedDependencies = function findUnresolvedDependencies(gdraph, resolvedDependencies) {
  // force this true on first pass. pages need immediate scanning
  if (pagesAreScanned === false) {
    pagesAreScanned = true;
    return Array.from(gdraph.pages.values());
  }

  let deps = [];

  for (let [componentPath, node] of gdraph.components) {
    if (resolvedDependencies.has(componentPath) === false) {
      console.log(!!node);
      deps.push(node);
    }
  }

  return deps;
};