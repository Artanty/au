const { isTablesExist } = require('./scripts/saveToDb')
const { isDiscAlive } = require('./scripts/upload')

isTablesExist().then(() => {
  isDiscAlive()
})
