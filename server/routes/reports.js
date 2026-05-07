const express = require('express');
const router = express.Router();
const Report = require('../models/Report');

// GET all reports (summary list, sorted newest first)
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ date: -1 })
      .select('date submittedBy dayTotal nightTotal netTotal createdAt');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create or replace report for a date
router.post('/', async (req, res) => {
  try {
    const { date, day, night, deductions, submittedBy, dayTotal, nightTotal, netTotal } = req.body;

    // Upsert: replace existing report for same date
    const report = await Report.findOneAndUpdate(
      { date },
      { date, day, night, deductions, submittedBy, dayTotal, nightTotal, netTotal },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE report
router.delete('/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
