const path = require('path')
const fs = require('fs-extra');
const jsdom = require("jsdom");
const admZip = require("adm-zip");
const getAbspath = require('./lib/abspath');
const Converter = require("./converter.js");
const collectImgs = require('./plugins/collectImgs');

const { JSDOM } = jsdom;
const DOMParser = new JSDOM().window.DOMParser;

class Builder {
    constructor (file, outputDir, ins) {
        this.zip = null;
        this.file = file;
        this.ins = ins;
        this.imagePaths = null;
        this.outputfile = this.getOuputFileName();
        this.template = this.ins.template;
    }

    getOuputFileName () {
        const tempPath = getAbspath(this.file, this.ins.targetDirPath, this.ins.outputDir);
        // a/b/c/1.docx
        const ext = path.extname(tempPath);
        return tempPath.replace(new RegExp(`${ext}$`), '.html');
    }

    zipFile() {
        return new admZip(this.file);
    }

    getXmlDocument(xmlString) {
        const domParser = new DOMParser();
        return domParser.parseFromString(xmlString, "application/xml");
    }

    /**
     * 收集图片
     * @param {*} zip
     * @param {*} file
     * @returns
     */
    collectImgs(zip, file, DOMParser) {
        return collectImgs(zip, file, DOMParser);
    }

    /**
     * 将document.xml(解压缩后得到的文件)读取为text内容
     * @param {*} zip
     * @returns
     */
    getXmlStr (zip) {
        return zip.readAsText("word/document.xml");
    }

    convert () {
        fs.open(this.file, "r", (err, fd) => {
            if (err) {
                if (err.code === "ENOENT") {
                    console.error(`${this.file} is not exist`);
                    return;
                }
                throw err;
            }

            this.zip = this.zipFile();
            this.imgMap = this.collectImgs(this.zip, this.outputfile, DOMParser);
            this.ins.emit('zipReady', this.zip, this.file);

            const xmlContent = this.getXmlStr(this.zip);
            const xmlDocument = this.getXmlDocument(xmlContent);

            const htmlContent = new Converter(xmlDocument, this.imgMap).convert();
            const htmlRes = this.template.tl + htmlContent + this.template.tr;

            this.ins.emit('htmlReady', htmlRes);

            fs.outputFile(this.outputfile, htmlRes, (err) => {
                if (err) throw err;
                console.log(`${this.outputfile} is ok`);
            });
        });
    }
}

module.exports = Builder;
