let l = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><script type = ' text/javascript'> 
let loadXML  =   function(xmlString){
    var  xmlDoc = null ; 
    if ( ! window.DOMParser  &&  window.ActiveXObject){   
        var  xmlDomVersions  =  [ ' MSXML.2.DOMDocument.6.0 ' , ' MSXML.2.DOMDocument.3.0 ' , ' Microsoft.XMLDOM ' ];
        for ( var  i = 0 ;i < xmlDomVersions.length;i ++ ){
            try {
                xmlDoc  =   new  ActiveXObject(xmlDomVersions[i]);
                xmlDoc.async  =   false ;
                xmlDoc.loadXML(xmlString);  
                break ;
            } catch (e){
            }
        }
    }
    else if (window.DOMParser  &&  document.implementation  &&  document.implementation.createDocument){
        try {
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

let getDirectDomsByTagName = function(dom, tagName){
    let childs = Array.prototype.slice.call(dom.children);
    let doms = childs.filter((item)=>{
        return item.tagName === tagName
    })
    return doms
}

class Tbl{
    constructor(tblDom){
        this.tblDom = tblDom;
    }

    tblFn(){
        let tblLeft = "<table><tbody>"
        let tblRight = "</tbody></table>"
        let tblText = tblLeft;

        let trArray =  getDirectDomsByTagName(this.tblDom,'w:tr'), len = trArray.length;
        this.trArray = trArray;
        for(let i = 0;i<len; i++){
            let tr = trArray[i];
            tblText = tblText + this.trFn(tr,i);
        }

        tblText = tblText + tblRight;
        return tblText; 
    }

    trFn(trDom,rNum){
        let trStart = "<tr>", 
            trEnd = "</tr>", 
            trText = trStart;
        let tcArray = getDirectDomsByTagName(trDom,'w:tc'), len = tcArray.length;
        for(let i = 0;i<len; i++){
            let tc = tcArray[i];
            trText = trText + this.tcFn(tc,rNum, i);
        }
        trText = trText + trEnd;
        return trText;
    }

    tcFn(tcDom,rNum,cNum){
        let {colspan, vMerge, hasT} = this.getTcDomOptions(tcDom);
        if(vMerge === '1' &&!hasT){
            return ''
        }
        let rowspan;
        if(vMerge === 'restart'){
            let len = this.trArray.length;
            rowspan =1;
            for(let n = rNum+1;n<len;n++){
                let  tcArray = getDirectDomsByTagName(this.trArray[n],'w:tc')
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
        let tdStart = "<td ";
        let colspanStr = colspan?("colspan="+colspan):"";
        let rowspanStr = rowspan?("rowspan="+rowspan):"";
        tdStart = tdStart + colspanStr + " " + rowspanStr + '>';
        let tdEnd = "</td>";
        let tcText = tdStart;
        
        tcText = tcText + wanderDom(tcDom) + tdEnd;
    
        return tcText;
    }

    getTcDomOptions(tcDom){
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
}

 rFn = function(rArray){
    let br = "<br>",textContent = "",rTextArray = [];
    for(let i =0; i<rArray.length;i++){
        let r = rArray[i];
        let rFontFamily = r.getElementsByTagName('w:rFonts')[0].getAttribute('w:ascii');
        let rFontSize = r.getElementsByTagName('w:sz')[0].getAttribute('w:val')/100;
        let rColor = r.getElementsByTagName('w:color')[0] && r.getElementsByTagName('w:color')[0].getAttribute('w:val');
        let colorStr = rColor? ("color:#"+rColor+";") : "";
        let fontFamilyStr = rFontFamily? ("font-family:"+rFontFamily+";") : "";
        let fontSizeStr = rFontSize? ("font-size:"+rFontSize+"rem;") : "";
        let t = r.getElementsByTagName('w:t')[0];
        let tText = '<span style="'+ colorStr + fontFamilyStr + fontSizeStr + '">' +
                    t.textContent + 
                    "</span>";
        rTextArray.push(tText);
    }
    textContent = rTextArray.join('');
    return textContent
}


class P{
    constructor(pDom){
        this.pDom = pDom
    }

    pFn(){
        let rArray = getDirectDomsByTagName(this.pDom,'w:r');
        return '<p>'+ rFn(rArray)+'</p>';
    }
}

 wanderDom = function(dom){
    let htmlStr = '',childrens = dom.children,len = childrens.length;
    for(let i=0; i<len;i++){
        let children = childrens[i];
        let tagName = children.tagName;
        switch(tagName){
            case 'w:tbl': htmlStr= htmlStr + (new Tbl(children)).tblFn() ;break;
            case 'w:p': htmlStr= htmlStr + (new P(children)).pFn() ;break;
            default:break ;
        }
    }
    return htmlStr;
}

let convert = function(xmlDoc){
    let dom = xmlDoc.getElementsByTagName('w:body')[0];
    return wanderDom(dom);
}
`

let r = `</script></head><body></body></html>`

module.exports = {
    l,
    r
}

