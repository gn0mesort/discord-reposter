/**
 * discord-reposter
 * message.js
 *
 * A class for providing a uniform interface to stored Discord messages.
 */

'use strict'

class Message {
  constructor (id = '', author = '', content = '', time = 0, attachments = []) {
    this.id = id
    this.author = author
    this.content = content
    this.time = time
    this.attachments = attachments
  }
}

module.exports = { Message }
