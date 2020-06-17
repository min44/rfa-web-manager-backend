const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: false },
  display_name: { type: String, required: false },
  created_at: { type: String, required: false },
  deleted_at: { type: String, required: false },
  last_activity_at: { type: String, required: false },
  email: { type: String, required: false },
  language: { type: String, required: false },
  role: { type: String, required: true },
});

module.exports = model("User", schema);
