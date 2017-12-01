# remark-import

With remark-import, you can use `@import` statements to include one file from another.

## Thanks

The original version that this repo is forked from is `remark-include` by Stephen Belanger, which was instrumental
in getting this to work out properly. I have changed it from "include" to "import" to better match the terminology
which I am accustomed to and have added two additional features.

## Additional Features

While the original version by Stephen Belanger was good, it was missing two things that I felt were essential for
this to match my requirements. I have since then added the following two features:

1. An imported markdown file will "inherit" the heading levels. If the `import` statement happens under Heading 2,
for example, any heading 1 in the imported file will be "translated" to have header level 3. Future versions will
most likely have this as the default behavior but allow for a flag to import the file without translating header
levels.

2. Relative images and links in the imported files will have their paths rewritten to be relative the original
document rather than the imported file. So if `\usr\breki\text\document\` has the statement `@import ./extra/detail.md`
which, in turn, contains an image reference to `./img/JohnLocke.png`, the plugin will rewrite that path to instead
referece `./extra/img/JohnLocke.png`.

## Other Changes

A few other changes have been made to Stephen's original. They include:

- Removing all tests (New tests will be added later).
- Rewriting `var` statements to either `let` or `const` statements.
- Separating functions into separate files.
- Changing indentation in a few places to make the code easier to read for me.

## Coming soon

- [ ] Tests!
- [ ] A reworked tokenizer.
- [ ] Separate module for the walker? Feels overworked.

#### Licensed under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
