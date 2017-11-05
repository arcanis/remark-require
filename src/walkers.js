let fs      = require('fs')
let VFile   = require('vfile')
let path    = require('path')

module.exports = {

  loadContent: function (file) {
    // TODO Clean this up, the code here is dreadful. Three different
    //      returns, three catches that don't do anything with what they
    //      catch, and the an error at the end, which only works if we
    //      can be 100% certain that these things run in this order...
    try { return fs.readFileSync(file) } catch (e) {}
    try { return fs.readFileSync(file + '.md') } catch (e) {}
    try { return fs.readFileSync(file + '.markdown') } catch (e) {}
    throw new Error('Unable to import ' + file)
  },

  findIndex: function (array, fn) {
    for (let i = 0; i < array.length; i++) {
      if (fn(array[i], i)) {
        return i
      }
    }
    return -1
  },

  isHeading: function (node, text, depth) {
    if (node.type !== 'heading') {
      return false
    }
    if (text) {

      // TODO Not sure exactly what the logic behind these two lines is,
      //      but I don't dare touch them at the moment...
      let headingText = toString(node)
      return text.trim().toLowerCase() === headingText.trim().toLowerCase()
    }
    if (depth) {

      // TODO Same here - wouldn't this make us miss certain headers, if
      //      their header depth was lower than the argumented depth?
      return node.depth <= depth
    }
    return true
  },

  /**
  * @param {object}   node - The object to walk
  * @param {function} fn - A function to call on each node
  */
  walk: function (node, fn) {
    fn(node)
    if (node.children) {
      var self = this;
      node.children.forEach(function (n) {
        self.walk(n, fn)
      })
    }
  },

  /**
   * @param {object} full - The full path and contents of the object to save.
   */
  toFile: function (full) {
    return new VFile({
      path: full,
      contents: this.loadContent(full).toString('utf8')
    })
  }
}
