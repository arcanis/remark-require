/* eslint-disable max-statements, func-names */
let path = require('path')
let rebuild = require('./rebuild.js')
let walkers = require('./walkers.js')
const zero = 0
const one  = 1
const PLUGIN_NAME = 'remark-import'

function bumpAndLink (root, headerLevel, child) {
  root = rebuild.headings(root, headerLevel)
  root = rebuild.links(root, child.value.replace(/"/g, ''), child.source.dirname)
  return root
}

function splitAndMerge (children, i, root) {
  let head = children.slice(zero, i)
  let tail = children.slice(i + one)

  children = head.concat(root.children)
    .concat(tail)

  return children
}

function tokenizer (eat, value, silent) {
  let parseImport = /^@import (.*?)(\n|$)/
  let node

  while (parseImport.test(value)) {
    let file = value.match(parseImport)[1]
    let frag = '@import ' + file

    value = value.slice(frag.length)

    eat(frag)({
      source : this.file,
      type   : 'import',
      value  : file
    })
  }
  return node
}

module.exports = function (options) {
  var proc = this
  var prt = proc.Parser.prototype

  prt.blockTokenizers.import = tokenizer
  prt.blockMethods.unshift('import')

  return function transformer (ast, file) {
    let children = ast.children
    var headerLevel = 0

    for (let i = 0; i < children.length; i++) {

      let child = children[i]

      if (child.type === 'import') {
        let parsedImport = proc.parse(
          walkers.toFile(path.join(child.source.dirname, child.value.replace(/"/g, '')))
        )

        file.info(`Importing ${child.value} from @import statement.`, child.position, PLUGIN_NAME)
        let root = proc.runSync(parsedImport)

        root = bumpAndLink(root, headerLevel, child)
        children = splitAndMerge(children, i, root)
        i += root.children.length - one
      }

      if (child.type === 'heading') headerLevel = child.depth
    }
    ast.children = children
  }
}
