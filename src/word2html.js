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
 * 获取元素下某一层某个tagName的所有元素
 * @param {*} dom 
 */
const getDirectDomsByTagName = function(dom, tagName){
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
    /**
     * 
     * @return {string} tblText 返回table标签对应的html字符串  
     */
    tblFn(){
        //
        let tblLeft = `<table><tbody>`
        let tblRight = `</tbody></table>`
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
    /**
     * @param trDom: 处理<w:tr>标签对应的DOM
     * @param rNum:trDom所处的trArray的第几行
     * @return trText： 字符串，表示的是表格的一行的html字符串
     */
    trFn(trDom,rNum){
        let trStart = `<tr>`, 
            trEnd = `</tr>`, 
            trText = trStart;
        let tcArray = getDirectDomsByTagName(trDom,'w:tc'), len = tcArray.length;
        for(let i = 0;i<len; i++){
            let tc = tcArray[i];
            trText = trText + this.tcFn(tc,rNum, i);
        }
        trText = trText + trEnd;
        return trText;
    }
    /**
     * @param tcDom: 处理<w:tc>标签对应的DOM
     * @param rNum:trDom所处的trArray的第几行
     * @param cNum: 传入的tcDom处于tr中tcArray的第几个，即第几列
     * @return tcText： 字符串，表示的是表格的一行的html字符串
     */
    tcFn(tcDom,rNum,cNum){
        let {colspan, vMerge, hasT} = this.getTcDomOptions(tcDom);
        if(vMerge === '1' &&!hasT){
            return ''
        }
        // 合并行
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

/**
 * @param {*} rArray 数组，<w:r>标签对应的DOM组成的数组
 * @return {string} textContent 返回table标签对应的html字符串  
 */
const rFn = function(rArray){
    let br = `<br>`,textContent = '',rTextArray = [];
    // In browser
    // for(let i =0; i<rArray.length;i++){
    //     let r = rArray[i];
    //     let rFontFamily = r.getElementsByTagName('w:rFonts')[0].getAttribute('w:ascii');
    //     let rFontSize = r.getElementsByTagName('w:sz')[0].getAttribute('w:val')/100;
    //     let rColor = r.getElementsByTagName('w:color')[0] && r.getElementsByTagName('w:color')[0].getAttribute('w:val');
    //     let colorStr = rColor? ("color:#"+rColor+";") : "";
    //     let fontFamilyStr = rFontFamily? ("font-family:"+rFontFamily+";") : "";
    //     let fontSizeStr = rFontSize? ("font-size:"+rFontSize+"rem;") : "";
    //     let t = r.getElementsByTagName('w:t')[0];
    //     let tText = '<span style="'+ colorStr + fontFamilyStr + fontSizeStr + '">' +
    //                 t.textContent + 
    //                 "</span>";
    //     rTextArray.push(tText);
    // }

    // in nodejs
    for(let i =0; i<rArray.length;i++){
        let tArray = rArray[i].getElementsByTagName('w:t');
        let tText = '';
        for(let j=0;j<tArray.length;j++){
            tText = tText + tArray[j].textContent;
        }
        rTextArray.push(tText);
    }
    textContent = rTextArray.join('');
    return textContent
}


class P{
    constructor(pDom){
        this.pDom = pDom
    }
    /**
     * 无论是p还是table最终还是会到这个函数，用于取出最后的文字内容
     * @param {*} pDom 处理<w:p>标签对应的DOM,这个标签和tbl是互斥的
     * @return {string} htmlStr 返回table标签对应的html字符串  
     */
    pFn(){
        let rArray = getDirectDomsByTagName(this.pDom,'w:r');
        return '<p>'+ rFn(rArray)+'</p>';
    }
}

/**
 * 
 * @param {*} dom DOM子树根节点
 * @return htmlStr 字符串 
 */
const wanderDom = function(dom){
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

/**
 * 创建一个Wander类的实例，然后开始执行这个实例的start方法开始执行转换
 * @param {*} xmlDoc 整个XML的DOM树
 * @return htmlStr 字符串 
 */
let convert = function(xmlDoc){
    let dom = xmlDoc.getElementsByTagName('w:body')[0];
    return wanderDom(dom);
}

module.exports={
    convert
}