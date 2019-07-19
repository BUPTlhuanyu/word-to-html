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
    //如果文件存在
    fs.exists(absPath, function(exists){
        if(exists){
            //解压缩
            const zip = new admZip(absPath);
            //将document.xml(解压缩后得到的文件)读取为text内容
            var contentXml = zip.readAsText("word/document.xml");
            var len = item.length-1;
            var name = item.slice(0,len-4) + ".xml"
            fs.writeFileSync(name,contentXml)           
            // var http = require('http');
            // var server = http.createServer((req,res)=>{
            //     res.writeHead(200, {'Content-Type':'text/json'})
            //     var out={
            //         err:null,
            //         data:{
            //             showMessage:contentXml
            //         }
            
            //     };
            //     res.end(encodeURI(JSON.stringify(out),"utf-8"));
            // })
        
            // server.listen(3004,()=>{
            //     console.log('connect')
            // })
        }else{
            callback(resultList)
        }
    })
});