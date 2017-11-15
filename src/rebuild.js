let path   = require('path')
let abs    = require('path-absolute')
let walker = require('./walkers.js')

// ###########################################################################
// # This is the sub-module responsible for rebuilding the paths inside of any
// # Markdown files that are imported, as well as rebuilding the header levels
// # of any headers that may appear in the same files. Since the imported file
// # doesn't have to reside in the same directory as the importing file, every
// # path needs to be checked. Relative paths are the rebuilt in order to work
// # as intended.
// ###########################################################################

module.exports = {
  links: function (nodes, filepath, basepath) {
    walker.walk(nodes, function (node) {
      if (node.type === 'image' || node.type === 'link') {

        let truepath = path.resolve(path.dirname(filepath), node.url)
        node.url = path.relative(
          basepath,
          path.resolve(path.dirname(filepath), node.url)
        )
        }
    })
    return nodes
  },

  headings: function (nodes, baseDepth) {
    let headings = []
    walker.walk(nodes, function (node) {
        if (node.type === 'heading') {
            headings.push(node)
        }
    })
    let minDepth = headings.reduce(function (memo, h) {
        return Math.min(memo, h.depth)
    }, 6)
    let diff     = baseDepth + 1 - minDepth
    headings.forEach(function (h) {
        h.depth += diff
    })
    return nodes
  }
}