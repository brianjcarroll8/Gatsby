"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.readGatsbyPages = void 0;

var _fsExtra = _interopRequireDefault(require("fs-extra"));

// TODO: Implement dynamically generated pages
const readGatsbyPages = gatsbyRoot => {
  return _fsExtra.default.readdir(gatsbyRoot);
};

exports.readGatsbyPages = readGatsbyPages;