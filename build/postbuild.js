const { zip } = require('./scripts/zip')

/**
 * @params distFolderPath - путь до папки, в которой будет собран проект
 * пример:
 * "postbuild": "node ../build/postbuild.js --distFolderPath=dist/au",
 */
zip()
