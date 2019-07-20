# word-to-html 
![](https://img.shields.io/github/license/BUPTlhuanyu/word-to-html.svg)
![](https://img.shields.io/badge/node-%3Ev9.10.0-green.svg)

A tiny tool to convert Microsoft Word document to HTML in **Nodejs** and in **chrome**,
you can use the tool convert tables with merged cells and nested tables to html file in **Nodejs** or **chrome**, the online tool [wordhtml](https://wordhtml.com/) can not do this.
Beyond that, you can convert words with different font-family or font-size in a line to html string in **chrome**.

## **table example**
[example.html(mobile)](https://github.com/BUPTlhuanyu/word-to-html/blob/master/test/browser/example.jpg)

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
var word2html = require('word-to-html');
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
        
        var getDirectDomsByTagName = function(dom, tagName){
            var childs = Array.prototype.slice.call(dom.children);
            var doms = childs.filter((item,index)=>{
                return item.tagName === tagName
            })
            return doms
        }
        
        // amd-zip将docx格式的文件转换成xml的规则是：
        // table规则：
        // <w:tbl></w:tbl>表示整个表格                                                          tblFn:需要<table>包裹
        // <w:tr></w:tr>表示表格的一行                                                          trFn:需要<tr>包裹
        // <w:tc></w:tc>表示表格某一行的一列                                                    tcFn:需要<td></td>包裹
        // 在<w:tc></w:tc>这一列中，对应的word中有多少个回车就会生成多少个<w:p>，
        // 在<w:p></w:p>中，对应的word中有多少个软回车（向下的箭头↓），就会有多少<w:r></w:r>
        // 一般？：在<w:r></w:r>中的<w:t></w:t>就包裹了需要的文字内容
        // 这里需要注意的一个问题是：特殊符号比如上标也会单独成为一个<w:r></w:r>
        
        // 总之遍历到标签<w:t></w:t>则表示结束
        
        /**
         * 
         * @param {*} tblDom 处理<w:tbl>标签对应的DOM
         * @return {string} tblText 返回table标签对应的html字符串  
         */
        var tblFn = function(tblDom){
            //
            let tblLeft = `<table><tbody>`
            let tblRight = `</tbody></table>`
            let tblText = tblLeft;
        
            let trArray = getDirectDomsByTagName(tblDom,'w:tr'), len = trArray.length;
            for(let i = 0;i<len; i++){
                let tr = trArray[i];
                tblText = tblText + trFn(tr,i,trArray);
            }
        
            tblText = tblText + tblRight;
            return tblText; 
        }
        
        /**
         * @param trDom: 处理<w:tr>标签对应的DOM
         * @param rNum:trDom所处的trArray的第几行
         * @param trArray:表的所有行trArray
         * @return trText： 字符串，表示的是表格的一行的html字符串
         */
        var trFn = function(trDom,rNum,trArray){
            let trStart = `<tr>`, 
                trEnd = `</tr>`, 
                trText = trStart;
            let tcArray = getDirectDomsByTagName(trDom,'w:tc'), len = tcArray.length;
            for(let i = 0;i<len; i++){
                let tc = tcArray[i];
                trText = trText + tcFn(tc,rNum, i,trArray);
            }
            trText = trText + trEnd;
            return trText;
        }
        
        /**
         * @param tcDom: 处理<w:tc>标签对应的DOM
         * @param rNum:trDom所处的trArray的第几行
         * @param cNum: 传入的tcDom处于tr中tcArray的第几个，即第几列
         * @param trArray:表的所有行trArray
         * @return tcText： 字符串，表示的是表格的一行的html字符串
         */
        var tcFn = function(tcDom,rNum,cNum,trArray){
            let {colspan, vMerge, hasT} = getTcDomOptions(tcDom);
            if(!hasT){
                return ''
            }
            // 合并行
            let rowspan;
            if(vMerge === 'restart'){
                let len = trArray.length;
                rowspan =1;
                for(let n = rNum+1;n<len;n++){
                    let  tcArray = getDirectDomsByTagName(trArray[n],'w:tc')
                    if(tcArray.length-1 < cNum) break;
                    let tcPrDom = getDirectDomsByTagName(tcArray[cNum],'w:tcPr')[0];
                    let vMergeDom = getDirectDomsByTagName(tcPrDom,'w:vMerge')[0];
                    if(vMergeDom && vMergeDom.getAttribute('w:val')!=='restart'){
                        rowspan++ 
                    }else{
                        break;
                    }
                }
            } 
            let tdStart = `<td ${colspan?`colspan=${colspan}`:''} ${rowspan?`rowspan=${rowspan}`:''}>`, //合并列
                tdEnd = `</td>`,
                tcText = tdStart;
            
            tcText = tcText + wanderDom(tcDom) + tdEnd;
        
            return tcText;
        }
        
        /**
         * @param tcDom: 处理<w:tc>标签对应的DOM
         * @return ： combinations:{colspan, vMerge, hasT} 对象，表示的是表格的一行的html字符串
         */
        var getTcDomOptions = function(tcDom){
            let tcPrDom = getDirectDomsByTagName(tcDom,'w:tcPr')[0];
            let gridSpanDom = getDirectDomsByTagName(tcPrDom,'w:gridSpan')[0],
                vMergeDom = getDirectDomsByTagName(tcPrDom,'w:vMerge')[0],
                tDom = tcDom.getElementsByTagName('w:t');
            let colspan = gridSpanDom?gridSpanDom.getAttribute('w:val'):'';
            let vMerge = vMergeDom ?
                            vMergeDom.getAttribute('w:val') ? vMergeDom.getAttribute('w:val') : '1'
                            :
                            '' ;
            let hasT = tDom.length?true:false;
            return {colspan,vMerge, hasT}
        }
        
        
        /**
         * @param {*} rArray 数组，<w:r>标签对应的DOM组成的数组
         * @return {string} textContent 返回table标签对应的html字符串  
         */
        var rFn = function(rArray){
            var br = `<br>`,textContent = '',rTextArray = [];
                // In browser
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
        
        /**
         * 无论是p还是table最终还是会到这个函数，用于取出最后的文字内容
         * @param {*} pDom 处理<w:p>标签对应的DOM,这个标签和tbl是互斥的
         * @return {string} htmlStr 返回table标签对应的html字符串  
         */
        var pFn = function(pDom){
            let rArray = getDirectDomsByTagName(pDom,'w:r');
            return '<p>'+rFn(rArray)+'</p>';
        }
        
        /**
         * 
         * @param {*} dom DOM子树根节点
         * @return htmlStr 字符串 
         */
        var wanderDom = function(dom){
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
        
        
        
        /**
         * 
         * @param {*} xmlDoc 整个XML的DOM树
         * @return htmlStr 字符串 
         */
        let convert = function(xmlDoc){
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