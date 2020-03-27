"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.readDependencies = void 0;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _path = require("path");

var _readNodeModuleEntry = require("./read-node-module-entry");

var _extractDependencies = require("./extract-dependencies");

var _utils = require("./utils");

function lengthInUtf8Bytes(str) {
  // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}

const readDependencies = async (root, path) => {
  if (await (0, _readNodeModuleEntry.isNodeModuleRoot)(root, path)) {
    path = await (0, _readNodeModuleEntry.readNodeModuleEntry)(root, path);
  }

  const js = (await _fsExtra.default.readFile((0, _path.join)(root, (0, _utils.hasExtension)(path) ? path : `${path}.js`))).toString();
  const size = lengthInUtf8Bytes(js);
  const dependencies = await (0, _extractDependencies.extractDependencies)(root, path, js);
  return {
    path,
    size,
    dependencies,
    componentPath: (0, _path.join)(root, page)
  };
};

exports.readDependencies = readDependencies;