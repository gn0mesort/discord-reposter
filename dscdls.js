#!/usr/bin/env node

/**
 * dscdls.js
 * Discord ls
 *
 * List Discord messages from a parseable archive and optionally output dscrepost command line args
 */

const program = require('commander')
const { loadJSON, Parser, Message } = require('./index.js')

program
  .version('1.0.0')
  .usage('[options] FILE_NAME CHANNEL_ID')
  .description('List Discord messages from a parseable archive.')
  .option('--during <time>', 'Search for posts during the given day.')
  .option('--before <time>', 'Search for posts before the given time.')
  .option('--after <time>', 'Search for posts after the given time.')
  .option('--from <userid>', 'Search for posts by a specific user.')
  .option('--attachment', 'Search for posts that have attachments')
  .option('-p, --pipe', 'Generate output to be piped into dscrepost.')
  .parse(process.argv)

let file = program.args[0]
let channelID = program.args[1]
let data = Parser.parse(loadJSON(file))[channelID]

if (program.during) {
  let time = new Date(program.during)
  for (let message in data) {
    let messageTime = new Date(data[message].time)
    if (data[message] instanceof Message && (time.getUTCFullYear() !== messageTime.getUTCFullYear() ||
    time.getUTCMonth() !== messageTime.getUTCMonth() ||
    time.getUTCDate() !== messageTime.getUTCDate())) {
      delete data[message]
    }
  }
}
if (program.before) {
  let time = new Date(program.before).getTime()
  for (let message in data) {
    if (data[message] instanceof Message && data[message].time >= time) {
      delete data[message]
    }
  }
}
if (program.after) {
  let time = new Date(program.after).getTime()
  for (let message in data) {
    if (data[message] instanceof Message && data[message].time <= time) {
      delete data[message]
    }
  }
}
if (program.from) {
  for (let message in data) {
    if (data[message] instanceof Message && data[message].author !== program.from) {
      delete data[message]
    }
  }
}
if (program.attachment) {
  for (let message in data) {
    if (data[message] instanceof Message && data[message].attachments.length === 0) {
      delete data[message]
    }
  }
}
if (program.pipe) {
  for (let message in data) {
    if (!(data[message] instanceof Message)) {
      delete data[message]
    }
  }
  data = `${file};${channelID};${Object.keys(data).join(',')}`
}

console.log(data)

