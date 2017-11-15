// ############################################################################
// # See README.md for more information. This file is the wrapper around all of
// # the functions located under the /src directory. As such, it should be very
// # light-weight and uncomplicated, requiring little to no deeper research for
// # base understading. Complexity is hidden in the sub-modules that it loads.
// ############################################################################

let path      = require('path')
let rebuild   = require('./src/rebuild.js')
let tokenizer = require('./src/tokenizer.js')
let walkers   = require('./src/walkers.js')

module.exports = function (options) {
    let basepath = path.dirname(options.filename) || {
        // do nothing.
    }
    let proc = this
    let cwd  = path.dirname(process.mainModule.filename)
    let prt  = proc.Parser.prototype
    prt.blockTokenizers.import = tokenizer
    prt.blockMethods.unshift('import')

    // TODO - Rationalize away the 'file' here, it is not being used.
    return function transformer(ast, file) {
        let children    = ast.children
        let headerLevel = 0

        for (let i = 0; i < children.length; i++) {
            let child = children[i]

            // We'll save the most recent header level as a variable ...
            // ... Until we find the import statement.
            if (child.type === 'heading') {
                headerLevel = child.depth
            }
            if (child.type === 'import') {
                let root = proc.runSync(proc.parse(
                    walkers.toFile(path.join(child.source.dirname || cwd, child.value.replace(/"/g, '')))
                ))
                // Bump the headings of root up to the most recent header level
                root = rebuild.headings(root, headerLevel)

                root = rebuild.links(
                    root,
                    path.join(child.source.dirname || cwd, child.value.replace(/"/g, '')),
                    child.source.dirname
                )

                // Split and merge the head and tail around the imported document
                let head = children.slice(0, i)
                let tail = children.slice(i + 1)
                children = head.concat(root.children).concat(tail)

                // And update the offset before circling back again!
                i += root.children.length - 1
            }
        }
        ast.children = children
    }
}
