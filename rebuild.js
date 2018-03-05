let path = require('path')
let isLocalPath = require('is-local-path')
let walker = require('./walkers.js')

module.exports = {
  headings: function (nodes, baseDepth) {
    let headings = []

    walker.walk(nodes, (node) => {
      if (node.type === 'heading') headings.push(node)

    })

    let minDepth = headings.reduce((memo, h) => {
      return Math.min(memo, h.depth)
    }, 6)
    let diff = baseDepth + 1 - minDepth

    headings.forEach((h) => {
      h.depth += diff
    })

    return nodes
  },
  links: function (nodes, importPath, basePath) {
    walker.walk(nodes, (node) => {
      if ((node.type === 'image' || node.type === 'link' || node.type === 'definition') & isLocalPath(node.url)) node.url = path.resolve(basePath, path.resolve(path.dirname(path.join(basePath, importPath)), node.url))
    })

    return nodes
  }
}
