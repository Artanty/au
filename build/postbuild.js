const { zip } = require('./scripts/zip')

// saveToDb({
//   discId: '11zSVRVIz9Y43fsPbHfwBv2RVDMOJgJT4',
//   project: process.env.BAG_SERVICE
// })

/**
 * @params distFolderPath - путь до папки, в которой будет собран проект
 * пример:
 * "postbuild": "node ../build/postbuild.js --distFolderPath=dist/au",
 */
zip()
