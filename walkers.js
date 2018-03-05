let fs = require('fs')
let VFile = require('vfile')

function loadContent (file) {
  // TODO - Clean this up, the code here is dreadful.
  try {
    return fs.readFileSync(file)
  } catch (e) {}
  try {
    return fs.readFileSync(file + '.md')
  } catch (e) {}
  try {
    return fs.readFileSync(file + '.markdown')
  } catch (e) {}

  throw new Error('Unable to import ' + file)
}

function findIndex (array, fn) {
  for (let i = 0; i < array.length; i++) if (fn(array[i], i)) return i
  return -1
}

function isHeading (node, text, depth) {
  if (node.type !== 'heading') return false

  if (text) {
    let headingText = toString(node)

    return text.trim()
      .toLowerCase() === headingText.trim()
      .toLowerCase()
  }

  if (depth) return node.depth <= depth

  return true
}

function walk (node, fn) {
  fn(node)
  if (node.children) {
    var self = this

    node.children.forEach((n) => {
      self.walk(n, fn)
    })
  }
}

function toFile (full) {
  return new VFile({
    path     : full,
    contents : this.loadContent(full)
      .toString('utf8')
  })
}

module.exports = {
  loadContent : loadContent,
  findIndex   : findIndex,
  isHeading   : isHeading,
  walk        : walk,
  toFile      : toFile
}
