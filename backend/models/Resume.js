const mongoose = require('mongoose');

// Define the blueprint for our data packet
const resumeSchema = new mongoose.Schema({
  // Basic Info
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String }
  },
  
  // A brief professional summary
  summary: { type: String },
  
  // Experience is an array of objects, because a user can have multiple jobs/internships
  experience: [{
    company: { type: String },
    role: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String }
  }],
  
  // Education is also an array of objects
  education: [{
    institution: { type: String },
    degree: { type: String },
    graduationYear: { type: String }
  }],
  
  // Skills is just an array of simple strings (e.g., ["React", "Node", "VLSI"])
  skills: [{ type: String }]
  
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' timestamps

// Compile the schema into a model and export it
module.exports = mongoose.model('Resume', resumeSchema);