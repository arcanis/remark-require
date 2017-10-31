var VFile = require('vfile')
var path  = require('path')
var walkers  = require('./src/walkers.js');
var fs    = require('fs')

var parseImport = /^@import (.*)(\n|$)/

module.exports = function (options) {
    var proc   = this;
    options    = options || {}
    var cwd    = options.cwd || process.cwd()

    var prt = proc.Parser.prototype
    prt.blockTokenizers.import = tokenizer
    prt.blockMethods.unshift('import')

    return function transformer(ast, file) {
        var children    = ast.children
        var headerLevel = 0

        for (var i = 0; i < children.length; i++) {
            var child = children[i]

            // We'll save the most recent header level as a variable ...
            if (child.type === 'heading') {
              headerLevel = child.depth;
            }

            // ... Until we find the import statement.
            if (child.type === 'import') {
                // Load the file to be imported into 'root'
                var root = proc.runSync(proc.parse(
                    walkers.toFile(path.join(child.source.dirname || cwd, child.value))
                ))

                console.log(root);

                // Bump the headings of root up to the most recent header level
                root = walkers.bumpHeadings(root, headerLevel)
                root = walkers.bumpHeadings(root, headerLevel)

                // Split and merge the head and tail around the imported document
                var head = children.slice(0, i)
                var tail = children.slice(i + 1)
                children = head.concat(root.children).concat(tail)

                // And update the offset!
                i += root.children.length - 1
            }
        }

        ast.children = children
    }
}

function tokenizer (eat, value, silent) {
    var self     = this
    var settings = self.options
    var length   = value.length + 1
    var index    = -1
    var now      = eat.now()
    var node

    if (silent && parseImport.test(value)) {
        return true
    }

    // Replace all lines beginning with @import
    while (parseImport.test(value)) {
        var file = value.match(parseImport)[1]
        var frag = '@import ' + file
        value    = value.slice(frag.length)
        eat(frag)({
            type: 'import',
            source: this.file,
            value: file
        })
    }

    return node
}
