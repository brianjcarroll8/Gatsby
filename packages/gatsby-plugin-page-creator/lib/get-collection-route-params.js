"use strict";

exports.__esModule = true;
exports.getCollectionRouteParams = getCollectionRouteParams;

// This extracts params from its filePath counerpart
// and returns an object of it's matches.
// e.g.,
//   /foo/{id}, /foo/123 => {id: 123}
function getCollectionRouteParams(filePath, urlPath) {
  var params = {}; // remove the starting path to simplify the loop

  var fileParts = filePath.split("/");
  var urlParts = urlPath.split("/");
  fileParts.forEach(function (part, i) {
    if (!part.startsWith("{")) return;
    var key = part.replace("{", "").replace("}", "");
    params[key] = urlParts[i];
  });
  return params;
}