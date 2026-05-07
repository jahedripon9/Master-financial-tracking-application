const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  1000: { type: Number, default: 0 },
  500:  { type: Number, default: 0 },
  200:  { type: Number, default: 0 },
  100:  { type: Number, default: 0 },
  50:   { type: Number, default: 0 },
  20:   { type: Number, default: 0 },
  10:   { type: Number, default: 0 },
  5:    { type: Number, default: 0 },
  2:    { type: Number, default: 0 },
  1:    { type: Number, default: 0 },
}, { _id: false });

const reportSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
  day: shiftSchema,
  night: shiftSchema,
  deductions: {
    internet:   { type: Number, default: 0 },
    stationery: { type: Number, default: 0 },
    house:      { type: Number, default: 0 },
    other:      { type: Number, default: 0 },  // "extra"
  },
  submittedBy: { type: String, default: 'Jahed' },
  // Computed totals stored for quick listing
  dayTotal:   { type: Number, default: 0 },
  nightTotal: { type: Number, default: 0 },
  netTotal:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
