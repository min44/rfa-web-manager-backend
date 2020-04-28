const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, required: false },
    display_name: { type: String, required: false },
})

module.exports = model('User', schema)