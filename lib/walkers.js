module.exports = {
  loadContent: function (file) {
    try { return fs.readFileSync(file) }
    catch (e) {}
    try { return fs.readFileSync(file + '.md') }
    catch (e) {}
    try { return fs.readFileSync(file + '.markdown') }
    catch (e) {}
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
  bumpHeadings: function (root, baseDepth) {
    let headings = []
    walk(root, function (node) {
      if (node.type === 'heading') { headings.push(node) }
    })
    let minDepth = headings.reduce(function (memo, h) {
      return Math.min(memo, h.depth)
    }, 6)
    let diff = baseDepth + 1 - minDepth
    headings.forEach(function (h) { h.depth += diff })
    return root;
  },
  walk: function (node, fn) {
    fn(node)
    if (node.children) {
      node.children.forEach(function (n) { walk(n, fn) })
    }
  },
  rebuildLinks: function (nodes, dir, cwd) {
    walk(nodes, function (node) {
      if (node.type === 'imageReference') {
        if (path.isAbsolute(node.identifier.slice(1,-1)) === false) {
          node.identifier = '(./' + path.relative(cwd, (path.resolve(dir, node.identifier.slice(1,-1)))) + ')';
          node.alt = '(./' + path.relative(cwd, (path.resolve(dir, node.identifier.slice(1,-1)))) + ')';
        } else if (node.type === 'link') {
          if (path.isAbsolute(node.url) === false) {
            node.url = path.relative(cwd, (path.resolve(dir, node.url)));
          }
        }
      }});
      return nodes;
    }
  };
