"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createPagesFromCollectionBuilder = createPagesFromCollectionBuilder;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _extractQuery = require("./extract-query");

var _getMatchPath = require("./get-match-path");

var _gatsbyPageUtils = require("gatsby-page-utils");

var _getCollectionRouteParams = require("./get-collection-route-params");

var _babelParseToAst = require("gatsby/dist/utils/babel-parse-to-ast");

var _derivePath = require("./derive-path");

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _generator = _interopRequireDefault(require("@babel/generator"));

var t = _interopRequireWildcard(require("@babel/types"));

// Move this to gatsby-core-utils?
function isCreatePagesFromData(path) {
  return path.node.callee.type === "MemberExpression" && path.node.callee.property.name === "createPagesFromData" && path.get("callee").get("object").referencesImport("gatsby") || path.node.callee.name === "createPagesFromData" && path.get("callee").referencesImport("gatsby");
} // TODO: Do we need the ignore argument?


function createPagesFromCollectionBuilder(_x, _x2, _x3, _x4) {
  return _createPagesFromCollectionBuilder.apply(this, arguments);
}

function _createPagesFromCollectionBuilder() {
  _createPagesFromCollectionBuilder = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(filePath, absolutePath, actions, graphql) {
    var ast, queryString, callsiteExpression, _yield$graphql, data, errors, rootKey, nodes;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ast = (0, _babelParseToAst.babelParseToAst)(_fsExtra.default.readFileSync(absolutePath).toString(), absolutePath);
            (0, _traverse.default)(ast, {
              // TODO: Throw an error if this is not the export default ? just to encourage default habits
              CallExpression: function CallExpression(path) {
                if (!isCreatePagesFromData(path)) return;
                if (!t.isCallExpression(path)) return; // this might not be needed...

                callsiteExpression = (0, _generator.default)(path.node).code;
                var _path$node$arguments = path.node.arguments,
                    queryAst = _path$node$arguments[1];
                var string = "";

                if (t.isTemplateLiteral(queryAst)) {
                  string = queryAst.quasis[0].value.raw;
                }

                if (t.isStringLiteral(queryAst)) {
                  string = queryAst.value;
                }

                queryString = (0, _extractQuery.generateQueryFromString)(string, absolutePath);
              }
            });

            if (queryString) {
              _context.next = 4;
              break;
            }

            throw new Error("CollectionBuilder: There was an error generating pages from your collection.\n\nFilePath: " + filePath + "\nFunction: " + callsiteExpression + "\n    ");

          case 4:
            _context.next = 6;
            return graphql(queryString);

          case 6:
            _yield$graphql = _context.sent;
            data = _yield$graphql.data;
            errors = _yield$graphql.errors;

            if (!(!data || errors)) {
              _context.next = 13;
              break;
            }

            console.warn("Tried to create pages from the collection builder found at " + filePath + ".\nUnfortunately, the query came back empty. There may be an error in your query.");
            console.error(errors);
            return _context.abrupt("return");

          case 13:
            rootKey = /^\{([a-zA-Z]+)/.exec(queryString);

            if (!(!rootKey || !rootKey[1])) {
              _context.next = 16;
              break;
            }

            throw new Error("An internal error occured, if you experience this please an open an issue. Problem: Couldn't resolve the graphql keys in collection builder");

          case 16:
            nodes = data[rootKey[1]].nodes;

            if (nodes) {
              console.info("CollectionPageCreator:");
              console.info("   Creating " + nodes.length + " pages from " + filePath);
            }

            nodes.forEach(function (node) {
              var path = (0, _gatsbyPageUtils.createPath)((0, _derivePath.derivePath)(absolutePath, node));
              var params = (0, _getCollectionRouteParams.getCollectionRouteParams)((0, _gatsbyPageUtils.createPath)(filePath), path);
              var nodeParams = (0, _extractQuery.reverseLookupParams)(node, absolutePath);
              var matchPath = (0, _getMatchPath.getMatchPath)(path);
              console.info("   " + (matchPath.matchPath || path));
              actions.createPage((0, _extends2.default)({
                path: path
              }, matchPath, {
                component: absolutePath,
                context: (0, _extends2.default)({}, nodeParams, {
                  __params: params
                })
              }));
            });

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createPagesFromCollectionBuilder.apply(this, arguments);
}