var remark = require('remark')
var VFile = require('vfile')
var path = require('path')
var tap = require('tap')
var fs = require('fs')

var include = require('../index')
var processor = remark().use(include)

var map = {
  '@import a.md': '# A',
  '@import a': '# A',
  '@import b': '# B',
  '@import sub/sub': '# A\n\n# sub'
}

function transform (lines) {
  return lines
    .map(function (line) { return map[line] || line })
    .filter(function (v) { return !!v })
    .join('\n\n') + '\n'
}

function loadFile (filePath) {
  var fullpath = path.join(__dirname, filePath)
  return new VFile({
    path: fullpath,
    contents: fs.readFileSync(fullpath).toString()
  })
}

tap.test('should import by exact path', function (t) {
  var file = loadFile('exact.md')
  t.equal(
    processor.processSync(file).toString(),
    transform(file.contents.split('\n'))
  )
  t.end()
})

tap.test('should import by guessing extension', function (t) {
  var file = loadFile('guess.md')
  t.equal(
    processor.processSync(file).toString(),
    transform(file.contents.split('\n'))
  )
  t.end()
})

tap.test('should import from sub and super paths', function (t) {
  var file = loadFile('super.md')
  t.equal(
    processor.processSync(file).toString(),
    transform(file.contents.split('\n'))
  )
  t.end()
})

tap.test('should fail to import non-existent file', function (t) {
  t.throws(
    function () { processor.processSync('@import nope.md').toString() },
    'Unable to import ' + path.join(process.cwd(), 'nope.md')
  )
  t.end()
})
