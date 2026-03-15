const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume'); // Import our blueprint

// POST: Create a new resume
// Endpoint: /api/resumes
router.post('/', async (req, res) => {
    try {
        // req.body contains the JSON data sent from the frontend
        const newResume = new Resume(req.body); 
        
        // Await the save operation to the MongoDB cloud
        const savedResume = await newResume.save(); 
        
        // Send a 201 (Created) status code back with the saved data
        res.status(201).json(savedResume);
    } catch (error) {
        // If the data doesn't match our Schema, catch the error and send a 500 status
        console.error("Error saving resume:", error);
        res.status(500).json({ error: 'Failed to save resume data' });
    }
});

module.exports = router; // Export the router so server.js can use it