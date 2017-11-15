let fs      = require('fs')
let VFile   = require('vfile')

module.exports = {

    loadContent: function (file) {
    // TODO Clean this up, the code here is dreadful. Three different
    //      returns, three catches that don't do anything with what they
    //      catch, and the an error at the end, which only works if we
    //      can be 100% certain that these things run in this order...
        try { return fs.readFileSync(file) } catch (e) { /* Do nothing. */ }
        try { return fs.readFileSync(file + '.md') } catch (e) { /* Do nothing. */ }
        try { return fs.readFileSync(file + '.markdown') } catch (e) { /* Do nothing. */ }

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
            let headingText = toString(node)
            return text.trim().toLowerCase() === headingText.trim().toLowerCase()
        }

        if (depth) {
            return node.depth <= depth
        }

        return true
    },

    walk: function (node, fn) {
        fn(node)
        if (node.children) {
            var self = this
            node.children.forEach(function (n) {
                self.walk(n, fn)
            })
        }
    },

    toFile: function (full) {
        return new VFile({
            path: full,
            contents: this.loadContent(full).toString('utf8')
        })
    }
}
