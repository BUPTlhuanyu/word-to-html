var template = require('./template.js')
//解压缩word文件
var admZip = require('adm-zip');
var fs = require('fs');
var path = require('path');
var {convert} = require('./word2html.js');

const jsdom = require("jsdom")
const { JSDOM } = jsdom
global.DOMParser = new JSDOM().window.DOMParser

var loadXML  =   function(xmlString){
    var  xmlDoc = null ; 
    domParser  =   new DOMParser();
    xmlDoc  =  domParser.parseFromString(xmlString,  "application/xml" );
    return  xmlDoc;
}

var main = function(str){
    return convert(loadXML(str))
}

var beginConvert = function(abspath){
    if(path.extname(abspath)!=='.docx'){
      console.log(`can not convert ${abspath}, wrong ext !`)
      return 
    }
    fs.open(abspath, 'r', (err, fd) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.error(`${abspath} is not exist`);
          return;
        }
    
        throw err;
      }
      //解压缩
      const zip = new admZip(abspath);
      //将document.xml(解压缩后得到的文件)读取为text内容
      var contentXml = zip.readAsText("word/document.xml");
      var len = abspath.length-1;
      var name = abspath.slice(0,len-4) + ".html"
      // console.log(name,'is ok')
      var res = main(contentXml);
      // 获取res
      var htmlStr = template.tl + res + template.tr; 
      fs.writeFile(name,htmlStr,function(err){
        if(err)throw err
        console.log(`${process.cwd()+path.delimiter+name} is ok`)  
      })           
  });
}

var word2html = function(abspath){
    if(Array.isArray(abspath)){
      abspath.map((item)=>{
           beginConvert(item);
        });
    }else if(typeof abspath === 'string'){
      beginConvert(abspath);
    }
}

module.exports = word2html;