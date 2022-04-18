/**
 * @file TODO: Link
 */
const path = require('path')
const fs = require('fs-extra');
const klawSync = require('klaw-sync');
const EventEmitter = require('events');
const Builder = require('./builder.js');
const templateFormate = require("./lib/template.js");

class Word2Html extends EventEmitter{
    constructor(targetPath, options = {}) {
        super();
        // target
        const fileInfo = this.getFileInfo(targetPath);
        this.targetDirPath = fileInfo.targetDirPath;
        this.targetFilePaths = fileInfo.targetFilePaths;
        // output
        this.outputDir = options.outputDir || this.targetDirPath;
        // template
        this.template = this.initTemplate(options);
        // listener
        this.initLifecycle();
    }

    initLifecycle() {
        // this.on('zipReady', res => {
        //     console.log(res);
        // });
        // this.on('htmlReady', res => {
        //     console.log(res);
        // });
    }

    /**
     * 获取传入目标路径的信息：所在文件夹路径，文件名称
     * @param {*} targetPath
     * @returns
     */
    getFileInfo(targetPath) {
        const targetFilePaths = [];
        let targetDirPath = '';
        const stats = fs.statSync(targetPath);
        if (stats.code === 'ENOENT') {
            throw new Error(`${targetPath} is not a right path`);
        }
        if (stats.isDirectory()) {
            const filter = item => {
              const basename = path.extname(item.path)
              return basename === '.docx';
            }
            const paths = klawSync(targetPath, {filter});
            targetFilePaths.push(...paths);
        } else {
            if (path.extname(targetPath) !== '.docx') {
                throw new Error(`can not convert ${targetPath}, wrong ext !`);
            }
            targetDirPath = path.dirname(targetPath);
            targetFilePaths.push(targetPath);
        }
        return {
            targetFilePaths,
            targetDirPath
        }
    }

    initTemplate(options) {
        return templateFormate(options);
    }

    convert() {
        for (let targetFile of this.targetFilePaths) {
            const builder = new Builder(
                targetFile,
                this.outputDir,
                this
            );
            builder.convert();
        }
    }
}

module.exports = Word2Html;
