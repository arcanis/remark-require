let path = require('path')
const unified = require('unified')
const remarkParse = require('remark-parse')
const remarkHtml = require('remark-html')
const stringify = require('rehype-stringify')
let vfile = require('to-vfile')
let imp = require('./../')

unified()
  .use(remarkParse)
  .use(imp)
  .use(remarkHtml)
  .process(
    vfile.readSync(path.join(__dirname, 'includer.md')),
    (err, out) => {
      if (err) console.error(err)
      console.log(out)
    }
  );
