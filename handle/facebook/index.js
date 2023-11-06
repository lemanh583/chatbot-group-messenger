const login = require("facebook-chat-api");
const fs = require("fs");
const commandSchema = require("../../model/command");
const optionSchema = require("../../model/option");
const messageSchema = require("../../model/message");
const NodeCache = require("node-cache");
const path = require("path");

const credential = {
  appState: JSON.parse(fs.readFileSync("appstate.json", "utf-8")).cookies,
};

class Facebook {
  constructor(api) {
    this._api = api;
    this._cache = new NodeCache();
    this._currentUserId = null;
    this._queue = [];
  }

  static async init() {
    return new Promise((resolve, reject) => {
      login(credential, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }

  start() {
    this._currentUserId = this._api.getCurrentUserID();
    this._api.setOptions({ selfListen: true });

    this._api.listenMqtt(async (err, message) => {
      if (err) {
        console.error(err);
        return;
      }
      if (message.type == "presence") return;
      this.sendTypingIndicator(message.threadID)
      await Promise.all([
        await this.checkSender(message),
        await this.saveMessage(message),
      ]);

      if (message.senderID == this._currentUserId) return;
      if (message.type == "message" && message.body[0] == "/") {
        let reply = await optionSchema.findOne({ command: message.body });
        if (!reply) {
          this.replyWithMention(message.senderInfo, "Not found command", message.threadID)
          return;
        };
        this._queue.push({ topic_id: reply._id });
        let content = {
          body: reply.content,
          attachment: fs.createReadStream(path.join(__dirname, "../../images/free-images.jpg"))
        }
        this.replyWithMention(message.senderInfo, content, message.threadID);
      }

      if (message.type == "message_reply") {
        let messReply = await messageSchema.findOne({
          message_id: message?.messageReply?.messageID,
          thread_id: message?.messageReply?.threadID,
        });
        if (!messReply) return;
        let findOption = await optionSchema.findOne({
          option: message.body,
          parent_id: messReply.topic_id,
        });
        if(!findOption) {
          this.replyWithMention(message.senderInfo, "Not found option", message.threadID)
          return;
        }
        this._queue.push({ topic_id: findOption._id });
        this.replyWithMention(message.senderInfo, findOption.content, message.threadID);
      }
    });
  }

  sendMessage(message, threadID, ...args) {
    this._api.sendMessage(message, threadID, ...args);
  }

  sendTypingIndicator(threadId) {
    this._api.sendTypingIndicator(threadId)
  }

  async saveMessage(message) {
    let data = {
      type: message.type,
      body: message.body,
      timestamp: message.timestamp,
      message_id: message.messageID,
      thread_id: message.threadID,
      sender_id: message.senderID,
      reply_message_id: message?.messageReply?.messageID
        ? message?.replyMessage?.messageID
        : undefined,
      created_time: Date.now(),
      updated_time: Date.now(),
    };
    if (message.senderID == this._currentUserId && this._queue.length > 0) {
      let first = this._queue.shift();
      data.topic_id = first.topic_id;
    }
    return messageSchema.create(data);
  }

  replyWithMention(sender, content, threadID) {
    let dataReply = {
      mentions: [
        {
          id: sender.id,
          tag: sender.name,
        },
      ],
      body: `@${sender.name} \n ${typeof content == 'string' ? content : content.body}`,
    };
    if(content.attachment) {
      dataReply.attachment = content.attachment;
    }
    this.sendMessage(dataReply, threadID);
  }

  async checkSender(message) {
    let sender = this._cache.get(message.senderID);
    if (!sender) {
      let getInfo = await this.getUserInfo([message.senderID]);
      this._cache.set(message.senderID, getInfo[message.senderID]);
      sender = getInfo[message.senderID];
    }
    sender.id = message.senderID;
    message.senderInfo = sender;
  }

  async getUserInfo(ids) {
    return new Promise((resolve, reject) => {
      this._api.getUserInfo(ids, (err, ret) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(ret);
      });
    });
  }
}

module.exports = Facebook;
