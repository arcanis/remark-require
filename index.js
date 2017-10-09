var VFile = require('vfile')
var path = require('path')
var fs = require('fs')

var parseImport = /^@import (.*)(\n|$)/

module.exports = function (options) {
  var proc = this;
  options = options || {}
  var cwd = options.cwd || process.cwd()

  var prt = proc.Parser.prototype
  prt.blockTokenizers.import = tokenizer
  prt.blockMethods.unshift('import')

  return function transformer(ast, file) {
    var children = ast.children

    for (var i = 0; i < children.length; i++) {
      var child = children[i]
      if (child.type === 'import') {
          
          console.log("my object: %o", children)
          throw new Error('all done');
          
        // Load file and create VFile
        // console.log(cwd, file)
        // var file = toFile(path.join(file.dirname || cwd, child.value))

        // Parse vfile contents
        // var parser = new processor.Parser(file, null, processor)
        var root = proc.runSync(proc.parse(
          toFile(path.join(child.source.dirname || cwd, child.value))
        ))

        // Split and merge the head and tail around the new children
        var head = children.slice(0, i)
        var tail = children.slice(i + 1)
        children = head.concat(root.children).concat(tail)

        // Remember to update the offset!
        i += root.children.length - 1
      }
    }

    ast.children = children
  }
}

function tokenizer (eat, value, silent) {
  var self = this
  var settings = self.options
  var length = value.length + 1
  var index = -1
  var now = eat.now()
  var node

  if (silent && parseImport.test(value)) {
    return true
  }

  // Replace all lines beginning with @import
  while (parseImport.test(value)) {
    var file = value.match(parseImport)[1]
    var frag = '@import ' + file
    value = value.slice(frag.length)
    eat(frag)({
      type: 'import',
      source: this.file,
      value: file
    })
  }

  return node
}

function toFile(full) {
  return new VFile({path: full, contents: loadContent(full).toString('utf8')})
}

function loadContent(file) {
  console.log('loading', file)
  try { return fs.readFileSync(file) }
  catch (e) {}

  try { return fs.readFileSync(file + '.md') }
  catch (e) {}

  try { return fs.readFileSync(file + '.markdown') }
  catch (e) {}

  throw new Error('Unable to import ' + file)
}

function findIndex (array, fn) {
  for (var i = 0; i < array.length; i++) {
    if (fn(array[i], i)) {
      return i
    }
  }
  return -1
}

function isHeading (node, text, depth) {
  if (node.type !== 'heading') {
    return false
  }

  if (text) {
    var headingText = toString(node)
    // TODO: more flexible match?
    return text.trim().toLowerCase() === headingText.trim().toLowerCase()
  }

  if (depth) {
    return node.depth <= depth
  }

  return true
}

var MAX_HEADING_DEPTH = 99999

function bumpHeadings (root, baseDepth) {
  var headings = []
  walk(root, function (node) {
    if (node.type === 'heading') {
      headings.push(node)
    }
  })

  var minDepth = headings.reduce(function (memo, h) {
    return Math.min(memo, h.depth)
  }, MAX_HEADING_DEPTH)

  var diff = baseDepth + 1 - minDepth

  headings.forEach(function (h) {
    h.depth += diff
  })
}

function walk (node, fn) {
  fn(node)
  if (node.children) {
    node.children.forEach(function (n) {
      walk(n, fn)
    })
  }
}
