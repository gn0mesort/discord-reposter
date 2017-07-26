/**
 * parser.js
 *
 * Defines a basic message parser for Discord messages and static methods to access the functionality of multiple parsers
 */

'use strict'

// Requires
const fs = require('fs') // File system library

/**
 * Defines a Parser object. A Parser must contain at least a parseData() method and a detect() method
 * detect() should return a number between 0 and 1 indicating how compatible the input data is with the parser. A 1 indicates 100% and a 0 indicates 0%
 * parseData() should return an object containing Message objects indexed by message id
 */
class Parser {
  /**
   * Constructions a new Parser object
   * @param {Function} parseData A function that parses input data into Messages
   * @param {Function} detect A function that determines if input data is compatible with the parser
   */
  constructor (parseData, detect) {
    this.parseData = parseData
    this.detect = detect
  }

  /**
   * Parse input data based on parser modules
   * @param {Object} data The data object to parse into messages
   * @param {String} path A path to search for parser modules on
   * @return {Object} An object containing parsed Messages indexed by message id
   */
  static parse (data, path = `${__dirname}/parsers`) {
    let parsers = []
    let modules = Parser.load(path)
    for (let parser in modules) {
      parsers.push({
        score: modules[parser].detect(data),
        value: modules[parser]
      })
    }
    parsers.sort((a, b) => {
      if (a.score > b.score) {
        return -1
      } else if (a.score < b.score) {
        return 1
      } else {
        return 0
      }
    })

    return parsers[0].value.parseData(data)
  }

  /**
   * Load Parser modules from the given path or the default path
   * @param {String} path The path to search for modules on
   * @return {Object} An object containing the values in each found module
   */
  static load (path = `${__dirname}/parsers`) {
    let r = {}
    if (fs.statSync(path).isDirectory()) {
      let modules = fs.readdirSync(path).filter((elem) => {
        return elem.match(/.+\.js/g)
      })
      for (let loadModule of modules) {
        Object.assign(r, require(`${path}/${loadModule}`))
      }
    }
    return r
  }
}

module.exports = { Parser }
