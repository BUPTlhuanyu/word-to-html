# word-to-html

TODO:
- use tapple to provide hooks for user to handle html string;
- images is not right;

## feature
- images
- font-size color/style
- table


## example
```javascript
var path = require("path");
var Word2html = require("../src/index.js");
//Word document's absolute path
var absPath = path.join(__dirname, "test.docx");

const word2html = new Word2html(
    absPath,
    {
        outputDir: path.resolve(__dirname, 'temp')
    }
);
word2html.convert();
```

## event

### zipReady
- callback `<Function>`
    - zip `<admZip>`

you can use `zip` to get any resource you need, like images; [adm-zip](https://www.npmjs.com/package/adm-zip)

```javascript
var path = require("path");
var Word2html = require("../src/index.js");
//Word document's absolute path
var absPath = path.join(__dirname, "test.docx");

const word2html = new Word2html(
    absPath,
    {
        outputDir: path.resolve(__dirname, 'temp')
    }
);
word2html('zipReady', (zip) => {
    zip.getEntries();
});
word2html.convert();
```
