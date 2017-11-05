let path   = require('path')
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
  links: function (nodes, fullpath) {
    walker.walk(nodes, function (node) {

// cwd needs to be set to current path relative from root
// dir needs to be set to imported file's path relative from current path.
// link needs to be set to link relative from imported path.
// so:
//      cwd:  /tmp/script
//      dir:  ../docs
//     link:  ./import/img/thing.png

      // REBUILD RELATIVE IMAGE PATHS
      if (node.type === 'imageReference') {
        let link = node.identifier.slice(1,-1)
        if (path.isAbsolute(link) === false) {
          let dirname = path.dirname(fullpath);
          node.alt = node.identifier = '(' + path.join(dirname, link) + ')'
        }
      }

      // REBUILD RELATIVE LINK PATHS
      if (node.type === 'link' && path.isAbsolute(node.url) === false) {
        node.url = path.relative('/', fullpath)
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

    let minDepth = headings.reduce(function (memo, h) { return Math.min(memo, h.depth) }, 6)
    let diff = baseDepth + 1 - minDepth
    headings.forEach(function (h) { h.depth += diff })
    return nodes
  }
}

/*
  TODO - Does it fail if there are no headers in the imported file?
  TODO - Test absolute paths.
  TODO - Test web paths
  TODO - Anything other than links and images that needs to be rebuilt?
*/
