let remark = require('remark')
let vfile = require('to-vfile')
let imp = require('./../')

remark()
  .use(imp)
  .process(
    vfile.readSync('includer.md'),
    (err, out) => {
      if (err) console.err(err)
      console.log(out)
    }
  )
