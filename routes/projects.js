const express = require('express');
const router = express.Router();
const db = require('../database'); // This is your Pool from database.js

// Get all projects
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows || []);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  const { name, start_week, total_weeks, status, priority, notes, team_members } = req.body;
  
  console.log('Creating project:', req.body);
  
  if (!name || !start_week || !total_weeks) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const current_week = start_week;

  try {
    const query = `
      INSERT INTO projects (name, start_week, total_weeks, current_week, status, priority, notes, team_members)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`; // RETURNING * gives us the new row immediately
    
    const values = [
      name, 
      start_week, 
      total_weeks, 
      current_week, 
      status || 'Not Started', 
      priority || 'Medium', 
      notes || '', 
      team_members || ''
    ];

    const result = await db.query(query, values);
    console.log('Project created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, start_week, total_weeks, current_week, status, priority, notes, team_members } = req.body;
  
  try {
    const query = `
      UPDATE projects 
      SET name=$1, start_week=$2, total_weeks=$3, current_week=$4, status=$5, 
          priority=$6, notes=$7, team_members=$8, updated_at=CURRENT_TIMESTAMP
      WHERE id=$9
      RETURNING *`;
    
    const values = [name, start_week, total_weeks, current_week, status, priority, notes, team_members, id];
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('Project updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    console.log('Project deleted successfully');
    res.json({ message: 'Project deleted', deletedId: id });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
