var path = require('path');
var word2html = require('../lib/index.js');
//Word document's absolute path
var absPath = path.join(__dirname,'test.docx');
word2html(absPath,{tdVerticalAlign:'top'},'browser')