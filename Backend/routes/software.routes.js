// software.routes.js
const express = require('express');
const { AppDataSource } = require('../data-source');
const { Software } = require('../entities/Software');

const router = express.Router();

// Create a new software
// POST /api/software
router.post('/', async (req, res) => {
  const { name, description, accessLevels } = req.body;
  try {
    const softwareRepo = AppDataSource.getRepository(Software);
    const software = softwareRepo.create({ name, description, accessLevels });
    await softwareRepo.save(software);
    res.status(201).json({ msg: 'Software created', software });
  } catch (err) {
    console.error('Error creating software:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get list of all software
// GET /api/software
router.get('/', async (req, res) => {
  try {
    const softwareRepo = AppDataSource.getRepository(Software);
    const list = await softwareRepo.find();
    res.json({ software: list });
  } catch (err) {
    console.error('Error fetching software:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update software by id
// PATCH /api/software/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, accessLevels } = req.body;

  try {
    const softwareRepo = AppDataSource.getRepository(Software);
    const software = await softwareRepo.findOneBy({ id: parseInt(id) });

    if (!software) {
      return res.status(404).json({ msg: 'Software not found' });
    }

    if (name !== undefined) software.name = name;
    if (description !== undefined) software.description = description;
    if (accessLevels !== undefined) software.accessLevels = accessLevels;

    await softwareRepo.save(software);
    res.json({ msg: 'Software updated', software });
  } catch (err) {
    console.error('Error updating software:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Delete software by id
// DELETE /api/software/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const softwareRepo = AppDataSource.getRepository(Software);
    const result = await softwareRepo.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ msg: 'Software not found' });
    }

    res.json({ msg: 'Software deleted' });
  } catch (err) {
    console.error('Error deleting software:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
