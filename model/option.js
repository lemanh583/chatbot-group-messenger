const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const optionSchema = new Schema({
  command: String, // first message
  option: String,
  content: String,
  parent_id: String,
  created_time: { type: Number, default: Date.now },
  updated_time: { type: Number, default: Date.now },
});

const options = mongoose.model("options", optionSchema);
module.exports = options;
