const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commandSchema = new Schema({
    command: { type: String, index: { unique: true } },
    content: String,
    created_time: { type: Number, default: Date.now },
    updated_time: { type: Number, default: Date.now },
  });


  
  const commands = mongoose.model("commands", commandSchema);
  module.exports = commands;