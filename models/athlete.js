const mongoose = require('mongoose')

const athleteSchema = mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  trophy: { type: String, required: true },
  desc: { type: String, required: true }
})

const Athlete = module.exports = mongoose.model('Athlete', athleteSchema)