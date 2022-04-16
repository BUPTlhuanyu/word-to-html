/**
 * @file
 */
const path = require('path');
const fs = require('fs-extra');
const getAbspath = require('../lib/abspath');

module.exports = function (zip, targetFile) {
    const entries = zip.getEntries();
    const imagePaths = [];
    for (let entry of entries) {
        const PICTURE_EXPRESSION = /\.(png|jpe?g|gif|svg)(\?.*)?$/;
        const picReg = new RegExp(PICTURE_EXPRESSION);
        if (picReg.test(entry.name)) {
            let name = entry.name;
            const imgPath = path.dirname(targetFile) + path.sep + entry.name;
            fs.outputFileSync(
                imgPath,
                entry.getData(),
            );
            imagePaths.push(imgPath);
            console.log(`${name} is generated`);
        }
    }
    return imagePaths;
}
