// ############################################################################
// # See README.md for more information. This file is the wrapper around all of
// # the functions located under the /src directory. As such, it should be very
// # light-weight and uncomplicated, requiring little to no deeper research for
// # base understading. Complexity is hidden in the modules it loads.
// ############################################################################

let VFile   = require('vfile')
let path    = require('path')
let fs      = require('fs')
let walkers = require('./src/walkers.js');

let parseImport = /^@import (.*)(\n|$)/

module.exports = function (options) {
    let proc   = this;
    options    = options || {}
    let cwd    = options.cwd || process.cwd()

    let prt = proc.Parser.prototype
    prt.blockTokenizers.import = tokenizer
    prt.blockMethods.unshift('import')
    
    console.log(prt.blockTokenizers.import);

    return function transformer(ast, file) {
        let children    = ast.children
        let headerLevel = 0

        for (let i = 0; i < children.length; i++) {
            let child = children[i]

            // We'll save the most recent header level as a variable ...
            if (child.type === 'heading') {
              headerLevel = child.depth;
            }

            // ... Until we find the import statement.
            if (child.type === 'import') {
                // Load the file to be imported into 'root'
                let root = proc.runSync(proc.parse(
                    walkers.toFile(path.join(child.source.dirname || cwd, child.value))
                ))

                console.log(root);

                // Bump the headings of root up to the most recent header level
                root = walkers.bumpHeadings(root, headerLevel)
                root = walkers.rebuildLinks(root, headerLevel)

                // Split and merge the head and tail around the imported document
                let head = children.slice(0, i)
                let tail = children.slice(i + 1)
                children = head.concat(root.children).concat(tail)

                // And update the offset!
                i += root.children.length - 1
            }
        }

        ast.children = children
    }
}

function tokenizer (eat, value, silent) {
    let self     = this
    let settings = self.options
    let length   = value.length + 1
    let index    = -1
    let now      = eat.now()
    let node

    if (silent && parseImport.test(value)) {
        return true
    }

    // Replace all lines beginning with @import
    while (parseImport.test(value)) {
        let file = value.match(parseImport)[1]
        let frag = '@import ' + file
        value    = value.slice(frag.length)
        eat(frag)({
            type: 'import',
            source: this.file,
            value: file
        })
    }

    return node
}
