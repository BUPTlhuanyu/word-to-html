const templateFormate = require('./template.js')
let template;
//解压缩word文件
const admZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const {convert} = require('./word2html.js');

const jsdom = require("jsdom")
const { JSDOM } = jsdom
global.DOMParser = new JSDOM().window.DOMParser

let loadXML  =   function(xmlString){
    let  xmlDoc = null ; 
    domParser  =   new DOMParser();
    xmlDoc  =  domParser.parseFromString(xmlString,  "application/xml" );
    return  xmlDoc;
}

let main = function(str){
    return convert(loadXML(str))
}

/**
 * 
 * @param {*} abspath 字符串 绝对路径
 */
let beginConvert = function(abspath){
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
      let contentXml = zip.readAsText("word/document.xml");
      let len = abspath.length-1;
      let name = abspath.slice(0,len-4) + ".html"
      let res = main(contentXml);
      // 获取res
      let htmlStr = template.tl + res + template.tr; 
      fs.writeFile(name,htmlStr,function(err){
        if(err)throw err
        console.log(`${process.cwd()+path.delimiter+name} is ok`)  
      })           
  });
}

/**
 * 
 * @param {*} abspath 字符串 绝对路径
 */
const browserStr = require('./browser.js')
let generateHTMLtoGetStr = function(abspath){
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
    let contentXml = '`'+zip.readAsText("word/document.xml")+'`';
    let len = abspath.length-1;
    let name = abspath.slice(0,len-4) + "browser.html";

    
    let str =  browserStr.l + `let res = convert(loadXML(${contentXml}));console.log(res)` + browserStr.r;

    fs.writeFile(name,str,function(err){
      if(err)throw err
      console.log(`${process.cwd()+path.delimiter+name} is ok`)  
      console.log(`请打开该html文件，console panel输出的结果就是html str`)
    })           
});
}

/**
 * 
 * @param {*} abspath 绝对路径字符串或者绝对路径数组
 * @param {*} options 暂时只支持表格td的内容水平垂直对齐的配置，比如{tdTextAlign:'center',tdVerticalAlign:'top'}
 */
let word2html = function(abspath,options = {},type = 'node'){
  switch(type){
    case 'node':
        template = templateFormate(options)
        if(Array.isArray(abspath)){
          abspath.map((item)=>{
               beginConvert(item,options);
            });
        }else if(typeof abspath === 'string'){
          beginConvert(abspath,options);
        }
        break;
    case 'browser':
        if(Array.isArray(abspath)){
          abspath.map((item)=>{
               generateHTMLtoGetStr(item);
            });
        }else if(typeof abspath === 'string'){
          generateHTMLtoGetStr(abspath);
        }
        break;
    default :;        
  }
}

module.exports = word2html;