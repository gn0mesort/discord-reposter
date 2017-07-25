const fs = require('fs')

module.exports = {
  loadJSON: function (path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  }
}
