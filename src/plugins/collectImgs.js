/**
 * @file
 */
const path = require('path');
const fs = require('fs-extra');
const getAbspath = require('../lib/abspath');

module.exports = function (zip, targetFile, DOMParser) {
    const entries = zip.getEntries();
    const imgMap = new Map();
    const imgIdMap = new Map();
    try {
        const bufferData = zip.readFile('word/_rels/document.xml.rels');
        const relationShipStr = bufferData.toString('utf8');
        console.log(relationShipStr);
        const domParser = new DOMParser();
        const relationShipDom = domParser.parseFromString(relationShipStr, "application/xml");
        const relationships = relationShipDom.getElementsByTagName('Relationship');
        for (let rels of relationships) {
            const Target = `word/${rels.getAttribute('Target')}`;
            const Id = rels.getAttribute('Id');
            imgIdMap.set(Target, Id);
        }
    } catch (err) {
        console.warn('Image map error');
    }

    for (let entry of entries) {
        const PICTURE_EXPRESSION = /\.(png|jpe?g|gif|svg)(\?.*)?$/;
        const picReg = new RegExp(PICTURE_EXPRESSION);
        if (picReg.test(entry.name)) {
            let name = entry.name;
            const entryName = entry.entryName;
            const imgPath = path.dirname(targetFile) + path.sep + entry.name;
            fs.outputFileSync(
                imgPath,
                entry.getData(),
            );

            const id = imgIdMap.get(entryName);
            imgMap.set(id, {
                path: imgPath,
                name,
                entryName,
                id
            });

            if (!id) {
                console.log(`${entryName} has no id,it is must be some error happened in adm-zip`);
            }
            console.log(`${name} is generated`);
        }
    }
    return imgMap;
}
