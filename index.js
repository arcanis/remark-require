/* eslint-disable max-statements, func-names */
let path = require('path')
let rebuild = require('./rebuild.js')
let walkers = require('./walkers.js')

function bumpAndLink (root, headerLevel, child) {
  root = rebuild.headings(root, headerLevel)
  root = rebuild.links(root, child.value.replace(/"/g, ''), child.source.dirname)
  return root
}

function splitAndMerge (children, i, root) {
  let head = children.slice(0, i)
  let tail = children.slice(i + 1)

  children = head.concat(root.children)
    .concat(tail)

  return children
}

function tokenizer (eat, value, silent) {
  let parseRequire = /^@require (.*?)(\n|$)/
  let node

  while (parseRequire.test(value)) {
    let file = value.match(parseRequire)[1]
    let frag = '@require ' + file

    value = value.slice(frag.length)

    eat(frag)({
      source : this.file,
      type   : 'require',
      value  : file
    })
  }
  return node
}

module.exports = function (options) {
  var prt = this.Parser.prototype

  prt.blockTokenizers.require = tokenizer
  prt.blockMethods.unshift('require')

  return async (ast, file) => {
    var headerLevel = 0

    const visit = async tree => {
      let children = tree.children
      if (!children) return

      for (let i = 0; i < children.length; ++i) {
        let child = children[i]

        switch (child.type) {
          case 'require': {
            let parsedRequire = this.parse(walkers.toFile(path.join(child.source.dirname, child.value.replace(/"/g, ''))))
            let processed = await this.run(parsedRequire)

            processed = bumpAndLink(processed, headerLevel, child)
            children = splitAndMerge(children, i, processed)
            i -= 1
          } break;

          case 'heading': {
            headerLevel = child.depth
          } break;

          default: {
            await visit(child)
          } break;
        }
      }

      tree.children = children
    };

    await visit(ast)
  }
}
