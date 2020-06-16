"use strict";

exports.__esModule = true;
exports.getMatchPath = getMatchPath;

// Does the following transformations:
//   `/foo/[id]/` => `/foo/:id`
//   `/foo/[...id]/` => `/foo/*id`
//   `/foo/[...]/` => `/foo/*`
function getMatchPath(srcPagesPath) {
  if (srcPagesPath.includes("[") === false) return {};
  return {
    matchPath: srcPagesPath.replace("[...", "*").replace("[", ":").replace("]", "").replace(/\/$/, "")
  };
}