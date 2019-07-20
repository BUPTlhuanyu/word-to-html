var path = require('path');
var word2html = require('../src/index.js');
//Word document's absolute path
var absPath = path.join(__dirname,'test.docx');
console.log(absPath)
word2html(absPath,{tdVerticalAlign:'top'})