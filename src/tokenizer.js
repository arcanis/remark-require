module.exports = function (eat, value, silent) {
    /*
        let self     = this
        let settings = self.options
        let length   = value.length + 1
        let index    = -1
        let now      = eat.now()
    */
    let parseImport = /^@import (.*?)(\n|$)/
    let node

    if (silent && parseImport.test(value)) { return true }

    // TODO: Strip characters that doesn't belong in the file name, just
    //       in case people write their syntax like: @import "foo.md"

    while (parseImport.test(value)) {
        let file = value.match(parseImport)[1]
        let frag = '@import ' + file
        value    = value.slice(frag.length)
        eat(frag) ({
            type: 'import',
            source: this.file,
            value: file
        })
    }
    return node
}
