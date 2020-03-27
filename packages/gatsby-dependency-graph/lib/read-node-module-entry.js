"use strict";

exports.__esModule = true;
exports.readNodeModuleEntry = exports.isNodeModuleRoot = void 0;

var _path = require("path");

var _fsExtra = require("fs-extra");

const isNodeModuleRoot = async (root, path) => {
  try {
    await (0, _fsExtra.readFile)((0, _path.join)(root, path, "package.json"));
    return true;
  } catch (e) {
    return false;
  }
};

exports.isNodeModuleRoot = isNodeModuleRoot;

const readNodeModuleEntry = async (root, path) => {
  const packageJSON = JSON.parse((await (0, _fsExtra.readFile)((0, _path.join)(root, path, "package.json"))).toString());
  return (0, _path.join)(path, packageJSON.main || packageJSON.module || "./index.js");
};

exports.readNodeModuleEntry = readNodeModuleEntry;