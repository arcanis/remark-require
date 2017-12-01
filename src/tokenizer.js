function tokenizer (eat, value, silent) {
  let parseImport = /^@import (.*?)(\n|$)/
  let node

  if (silent && parseImport.test(value)) {
    return true
  }

  while (parseImport.test(value)) {
    let file = value.match(parseImport)[1]
    let frag = '@import ' + file
    value = value.slice(frag.length)
    eat(frag)({
      type: 'import',
      source: this.file,
      value: file
    })
  }
  return node
}

module.exports = {
  tokenizer: tokenizer
}
