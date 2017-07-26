#!/usr/bin/env node

/**
 * dscdrepost.js
 * Discord Repost
 *
 * Repost specified Discord messages from a parseable archive
 */

const program = require('commander')
const { Client } = require('discord.js')
const getStdin = require('get-stdin')
const { loadJSON, Parser, Message } = require('./index.js')
const readline = require('readline')

function acquireMetadata (message, meta, client) {
  let time = new Date(message.time).toUTCString()
  let tag = (() => {
    return client.users.has(message.author) ? client.users.get(message.author).tag : message.author
  })()
  return `\`\`\`\nMETADATA\nMessage from: ${tag}\nMessage to: #${meta.channel || 'Unknown'}\nMessage on: ${meta.server || 'Unknown'}\nPosted at: ${time}\n\`\`\``
}

function verboseLog (message, meta, client) {
  console.log(acquireMetadata(message, meta, client))
  console.log(message.content)
  console.log(message.attachments)
}

function log (message) {
  console.log(message.content)
  console.log(message.attachments)
}

function repost (messages, meta, client, config) {
  let r = []
  let channel = client.guilds.get(config.server).channels.get(config.channel)
  if (channel.type !== 'voice') {
    for (let id in messages) {
      let content = `${meta ? acquireMetadata(messages[id], meta, client) + '\n' : ''}${messages[id].content}`
      for (let attachment of messages[id].attachments) {
        content += `\n${attachment}`
      }
      r.push(channel.send(content, {
        split: true
      }))
    }
  }
  return r
}

function login (client, token) {
  if (token) {
    client.login(token)
  } else {
    throw new Error('Token not found!')
  }
}

program
  .version('1.0.0')
  .usage('[options] FILE_NAME CHANNEL_ID MESSAGE_IDS')
  .description('Repost Discord messages from a parseable archive.')
  .option('-t, --token <token>', 'Specifies a user token to use with Discord. Overrides the config file.')
  .option('-S, --server <serverid>', 'Specifies a server to repost to. Overrides the config file.')
  .option('-c, --channel <channelid>', 'Specifies a channel to repost to. Overrides the config file.')
  .option('-y, --yes, --confirm', 'Confirm sending without prompting.')
  .option('-s, --strip', 'Strip metadata before posting.')
  .option('-v, --verbose', 'Log messages with metadata before sending.')
  .option('--config <config_file>', 'Force the usage of a specific configuration file', /^.+\.(?:js|json)$/)
  .parse(process.argv)

if (program.args.length < 3 && process.stdin.isTTY) {
  program.help()
}
let file = program.args[0] || null
let channelID = program.args[1] || null
let messages = program.args[2] || null
let client = new Client()
let config = require(program.config || './config.json')
let meta = null

if (program.token) {
  config.token = program.token
}
if (program.server) {
  config.server = program.server
}
if (program.channel) {
  config.channel = program.channel
}
client.once('ready', () => {
  let data = Parser.parse(loadJSON(file))[channelID]
  let rl = readline.createInterface(process.stdin, process.stdout)
  meta = {
    server: data.server,
    channel: data.name
  }
  delete data.server
  delete data.name
  messages = messages.split(',')
  for (let message in data) {
    if (messages.indexOf(message) === -1) {
      delete data[message]
    }
  }
  for (let message in data) {
    if (program.verbose) {
      verboseLog(data[message], meta, client)
    } else {
      log(data[message])
    }
  }
  if (!program.yes) {
    rl.question('Send Messages to Discord? [Y/n] ', (answer) => {
      if (answer.toLowerCase().startsWith('y') || answer === '') {
        Promise.all(repost(data, program.strip ? null : meta, client, config)).then(() => {
          client.destroy().then(() => {
            rl.close()
            process.exit(0)
          })
        })
      }
    })
  } else {
    Promise.all(repost(data, program.strip ? null : meta, client, config)).then(() => {
      client.destroy().then(() => {
        rl.close()
        process.exit(0)
      })
    })
  }
}).on('error', (err) => {
  console.error(err)
  process.exit(1)
})
if (!process.stdin.isTTY) {
  process.stdin.setEncoding('utf8')
  let args = []
  getStdin().then((str) => {
    args = str.trim().split(';')
    if (args.length < 3) {
      program.help()
    }
    file = args[0]
    channelID = args[1]
    messages = args[2]
    login(client, config.token)
  }).catch((err) => {
    console.error(err)
    process.exit(1)
  })
  program.yes = true
} else {
  login(client, config.token)
}
