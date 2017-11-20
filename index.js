/*
 ============================================================================
 = See README.md for more information. This file is the wrapper around all of
 = the functions located under the /src directory. As such, it should be very
 = light-weight and uncomplicated, requiring little to no deeper research for
 = base understading.
 =
 = That said, there is too much overhead in this file so I should probably be
 = trimming it down in size at some point soon. Still some functionality left
 = before I can start thinking about optimization.
 ============================================================================
                                                                            */
let path = require('path')
let Progress = require('progress')
let rebuild = require('./src/rebuild.js')
let tokenizer = require('./src/tokenizer.js')
let walkers = require('./src/walkers.js')

const PLUGIN_NAME = 'remark-import'

module.exports = function (options) {
  let proc = this
  let prt = proc.Parser.prototype
  prt.blockTokenizers.import = tokenizer
  prt.blockMethods.unshift('import')

  return function transformer (ast, file) {
    let children = ast.children
    let bar = new Progress(`Converting @import nodes from ${path.basename(options.filename)}, :bar done`, {
      total: children.length,
      width: 80
    })
    var headerLevel = 0

    // =======================================================
    // = We want to loop through every node in the document so
    // = that we can find our @import statement. We keep track
    // = of which document we're currently reading by using an
    // = iterator variable called, appropriately enough, 'i'
    // =======================================================
    for (let i = 0; i < children.length; i++) {
      let child = children[i]

      // =====================================================
      // = We're keeping track of the most recent header so we
      // = know it. Once we get to the headers of the imported
      // = file, we'll be using the depth of the most recent's
      // = header in order to rebuild the headers of the newly
      // = imported file.
      // =====================================================
      if (child.type === 'heading') { headerLevel = child.depth }

      // =====================================================
      // = This is where the magic happens. We've gone through
      // = a couple of nodes, and here we find ourselves in an
      // = @import statement. So during the next 3 lines we'll
      // = take the import target file and load it into vFile,
      // = so that we have something to play around with.
      // =====================================================
      if (child.type === 'import') {
        let parsedImport = proc.parse(
          walkers.toFile(path.join(child.source.dirname, child.value.replace(/"/g, '')))
        )
        file.info(`Importing ${child.value} from @import statement.`, child.position, PLUGIN_NAME)
        let root = proc.runSync(parsedImport)

        // Bump the headings of root up to the most recent header level
        root = rebuild.headings(root, headerLevel)
        root = rebuild.links(root, child.value.replace(/"/g, ''), child.source.dirname)

        // Split and merge the head and tail around the imported document
        let head = children.slice(0, i)
        let tail = children.slice(i + 1)
        children = head.concat(root.children).concat(tail)

        // And update the offset before circling back again!
        i += root.children.length - 1
      }

      bar.tick()
      if (bar.complete) {
        console.log('... done!')
      }
    }
    ast.children = children
  }
}
