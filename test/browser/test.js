//解压缩word文件
var admZip = require('adm-zip');
var fs = require('fs');
var path = require('path');
//参数是word文件名,第二个参数是回调表示解析完成
var resultList = [];
const tableName = [
    'test.docx'
];
tableName.forEach((item, index)=>{
    var absPath = path.join(__dirname,item);
    fs.exists(absPath, function(exists){
        if(exists){
            const zip = new admZip(absPath);
            var contentXml = zip.readAsText("word/document.xml");
            var len = item.length-1;
            var name = item.slice(0,len-4) + ".xml"
            fs.writeFileSync(name,contentXml)           
        }else{
            callback(resultList)
        }
    })
});