'use strict'

const { Parser } = require('../parser.js')
const { Message } = require('../message.js')

module.exports = {
  'sarah': new Parser((data) => {
    let r = {}
    for (let timestamp in data) {
      let record = data[timestamp]
      if (!(record.in.id in r)) {
        r[record.in.id] = {
          name: record.in.name
        }
      }
      r[record.in.id][record.msgId] = new Message(record.msgId, record.user.id, record.content.message, Number(timestamp), record.content.attachments)
    }
    return r
  }, (data) => {
    let record = data[Object.keys(data)[0]]
    if ('in' in record && 'msgId' in record && 'user' in record && 'content' in record) {
      return 1.0
    } else {
      return 0
    }
  })
}
