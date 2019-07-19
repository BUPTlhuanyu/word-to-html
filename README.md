# word-to-html
A tiny tool to convert Microsoft Word document to HTML in **Nodejs** and in **chrome**

## **attention**
If a line of words have different font-family or font-size in your .docx, it can not convert
your .docx to html expectly in nodejs, but this can fix in the browsers such as chrome. because 
the npm package `jsdom` can not realize the `DOMParser`'s function perfectly. 
So if you want to convert the font-family and font-size exactly, you can see how to use `word2html.js` in browsers!

## **Install**
```
npm i word-to-html --save-dev
```
**or**
```
yarn add word-to-html
```
## **Usage in nodejs**

```
var path = require('path');
var word2html = require('word2html');
//Word document's absolute path
var absPath = path.join(__dirname,'example.docx');
word2html(absPath)
```
the html generated in your WorkSpace.

## **Usage in browsers**
details in my [github](https://github.com/BUPTlhuanyu)
#### step 1: Take the code in your html or your `console panel` as the global functions 
```
<script type = ' text/javascript'> 
        loadXML  =   function(xmlString){
            var  xmlDoc = null ; 
            if ( ! window.DOMParser  &&  window.ActiveXObject){    // window.DOMParser 判断是否是非ie浏览器 
                var  xmlDomVersions  =  [ ' MSXML.2.DOMDocument.6.0 ' , ' MSXML.2.DOMDocument.3.0 ' , ' Microsoft.XMLDOM ' ];
                for ( var  i = 0 ;i < xmlDomVersions.length;i ++ ){
                    try {
                        xmlDoc  =   new  ActiveXObject(xmlDomVersions[i]);
                        xmlDoc.async  =   false ;
                        xmlDoc.loadXML(xmlString);  // loadXML方法载入xml字符串 
                        break ;
                    } catch (e){
                    }
                }
            }
            else if (window.DOMParser  &&  document.implementation  &&  document.implementation.createDocument){
                try {
                    /*  DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
                    * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
                    * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
                    * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
                    */ 
                    domParser  =   new DOMParser();
                    xmlDoc  =  domParser.parseFromString(xmlString,  "application/xml" );
                } catch (e){

                }
            }
            else {
                return   null ;
            }
            return  xmlDoc;
        }
        
         getDirectDomsByTagName = function(dom, tagName){
            var childs = Array.prototype.slice.call(dom.children);
            var doms = childs.filter((item,index)=>{
                return item.tagName === tagName
            })
            return doms
        }
        
         tblFn = function(tblDom){
            //
            let tblLeft = `<table><tbody>`
            let tblRight = `</tbody></table>`
            let tblText = tblLeft;
        
            let trArray = getDirectDomsByTagName(tblDom,'w:tr'), len = trArray.length;
            for(let i = 0;i<len; i++){
                let tr = trArray[i];
                tblText = tblText + trFn(tr);
            }
        
            tblText = tblText + tblRight;
            return tblText; 
        }
        
         trFn = function(trDom){
            let trStart = `<tr>`, 
                trEnd = `</tr>`, 
                trText = trStart;
            let tcArray = getDirectDomsByTagName(trDom,'w:tc'), len = tcArray.length;
            for(let i = 0;i<len; i++){
                let tc = tcArray[i];
                trText = trText + tcFn(tc);
            }
            trText = trText + trEnd;
            return trText;
        }
        
         tcFn = function(tcDom){
        
            let tdStart = `<td>`,
                tdEnd = `</td>`,
                tcText = tdStart;
            
            tcText = tcText + wanderDom(tcDom) + tdEnd;
        
            return tcText;
        }
        
         rFn = function(rArray){
            var br = `<br>`,textContent = '',rTextArray = [];
            for(let i =0; i<rArray.length;i++){
                var r = rArray[i];
                var rFontFamily = r.getElementsByTagName('w:rFonts')[0].getAttribute('w:ascii');
                var rFontSize = r.getElementsByTagName('w:sz')[0].getAttribute('w:val');
                var t = r.getElementsByTagName('w:t')[0];
                let tText = `<span style="font-family:${rFontFamily};font-size:${rFontSize/100}rem">` +
                            t.textContent + 
                            `</span>`;
                rTextArray.push(tText);
            }
            textContent = rTextArray.join('');
            return textContent
        }
        
         pFn = function(pDom){
            let rArray = getDirectDomsByTagName(pDom,'w:r');
            return '<p>'+rFn(rArray)+'</p>';
        }
        
         wanderDom = function(dom){
            let htmlStr = '',childrens = dom.children,len = childrens.length;
            for(let i=0; i<len;i++){
                let children = childrens[i];
                let tagName = children.tagName;
                switch(tagName){
                    case 'w:tbl': htmlStr= htmlStr + tblFn(children) ;break;
                    case 'w:p': htmlStr= htmlStr + pFn(children) ;break;
                    default:break ;
                }
            }
            return htmlStr;
        }
        
         convert = function(xmlDoc){
            let dom = xmlDoc.getElementsByTagName('w:body')[0];
            return wanderDom(dom);
        }
    </script>
```

#### step 2: Use the code to convert your .docx to `xml sting` in your .xml file
```
var admZip = require('adm-zip');
var fs = require('fs');
var path = require('path');
var resultList = [];
const tableName = [
    'test.docx' // replace your docx name here
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
```

#### step 3: Take your .xml file's string in variables `str`, and excute the code in your browser. the res is your html string, you can put it to the template html.
```
var str =`${your xml sting}`
var res = convert(loadXML(str));
```

#### step4:template example
html-body:
```
<div class="container">{res}</div>
```
head:
```
<script>
		(function (doc, win) {
			var docEl = doc.documentElement,
				resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
				recalc = function () {
					var clientWidth = docEl.clientWidth;
					if (!clientWidth) return;
					if (clientWidth >= 640) {
						docEl.style.fontSize = '100px';
					} else {
						docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
						var div = document.createElement('div');
						div.style.width = '1.4rem';
						div.style.height = '0';
						document.body.appendChild(div);
						var ideal = 140 * clientWidth / 750;
						var rmd = (div.clientWidth / ideal);
						if (rmd > 1.2 || rmd < 0.8) {
							docEl.style.fontSize = 100 * (clientWidth / 750) / rmd + 'px';
						}
						document.body.removeChild(div);
					}
				};
			if (!doc.addEventListener) return;
			win.addEventListener(resizeEvt, recalc, false);
			doc.addEventListener('DOMContentLoaded', recalc, false);
		})(document, window);
	</script>
	<style>
		body,
		html,
		table {
			padding: 0;
			margin: 0;
		}

		p {
			margin: 0.14rem 0;
			list-style-type: none;
			font-family: PingFang-SC-Medium;
			font-size: 0.28rem;
			color: #848484;
			letter-spacing: 0;
			text-align: justify;
			line-height: 0.48rem;
			padding: 0 0.3rem;
		}

		td {
			border: 1px solid #000;
			text-align: left;
			vertical-align: middle;
			font-family: PingFang-SC-Medium;
			font-size: 0.28rem;
			color: #848484;
		}

		.container>table {
			width: 6.9rem;
		}
		table {
			border-collapse: collapse;
		}

		.container {
			padding: 0.3rem
		}
	</style>
```