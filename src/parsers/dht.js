'use strict'

const { Parser } = require('../parser.js')
const { Message } = require('../message.js')

module.exports = {
  'dht': new Parser((data) => {
    let r = {}
    for (let channelID in data.data) {
      let channel = data.data[channelID]
      if (!(channelID in r)) {
        r[channelID] = {
          name: data.meta.channels[channelID].name,
          server: data.meta.servers[data.meta.channels[channelID].server].name
        }
      }
      for (let messageID in channel) {
        let record = data.data[channelID][messageID]
        r[channelID][messageID] = new Message(messageID, data.meta.userindex[record.u], record.m, record.t)
        if ('a' in record) {
          for (let attachment of record.a) {
            r[channelID][messageID].attachments.push(attachment)
          }
        }
      }
    }
    return r
  }, (data) => {
    if ('data' in data && 'meta' in data) {
      return 1.0
    } else {
      return 0
    }
  })
}
