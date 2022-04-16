/**
 * @file
 */
const path = require('path');

module.exports = function (filePath, dirPath, outputDirPath) {
    const relativePath = path.relative(dirPath, filePath);
    const tempPath = path.resolve(outputDirPath, relativePath);
    return tempPath;
}
