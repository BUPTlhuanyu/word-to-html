var path = require("path");
var Word2html = require("../src/index.js");
//Word document's absolute path
var absPath = path.join(__dirname, "word-to-html.docx");

const word2html = new Word2html(
    absPath,
    {
        outputDir: path.resolve(__dirname, 'temp')
    }
);
word2html.on('zipReady', zip => {
    zip.extractAllTo(path.resolve(__dirname, 'temp/entryfiles'));
});
word2html.convert();
