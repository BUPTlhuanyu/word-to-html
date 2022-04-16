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
