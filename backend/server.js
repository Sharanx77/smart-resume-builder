const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const User = require('./models/User'); // Import the User blueprint

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, { family: 4 })
.then(() => console.log('Secured Database Online!'))
.catch((err) => console.error('Connection Error:', err));

// --- UPDATED RESUME SCHEMA ---
const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The "Owner" tag
    fullName: String, email: String, phone: String, summary: String,
    degree: String, institution: String, skills: String,
    projects: String, certifications: String, awards: String,
    languages: String, associations: String
});
const Resume = mongoose.model('Resume', resumeSchema);

// --- AUTHENTICATION ROUTES (The Security Gate) ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User Registered!" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed. User might already exist." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        // Issue the Digital Keycard (JWT)
        const token = jwt.sign({ userId: user._id }, 'SECRET_KEY_123', { expiresIn: '1h' });
        res.json({ token, username });
    } catch (error) {
        res.status(500).json({ error: "Login failed." });
    }
});

// --- PROTECTED RESUME ROUTES ---
app.post('/api/resume', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, 'SECRET_KEY_123');
        
        const newResume = new Resume({ ...req.body, userId: decoded.userId });
        await newResume.save();
        res.status(201).json({ message: 'Resume saved to your private account!' });
    } catch (error) {
        res.status(401).json({ error: 'Security alert: Please login first.' });
    }
});

app.get('/api/resume', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, 'SECRET_KEY_123');
        const resume = await Resume.findOne({ userId: decoded.userId }).sort({ _id: -1 });
        res.json(resume);
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized.' });
    }
});

// --- AI CHATBOT (Restored Context-Aware Brain) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const currentResume = req.body.currentResume; // Grabbing the live form data
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Injecting the full JSON payload into the AI's prompt
        const prompt = `You are an expert technical resume consultant. 
        Here is the user's live resume data from their form: 
        ${JSON.stringify(currentResume)}
        
        Give short, highly actionable advice (under 3 sentences). If they ask to write or improve a section (like summary, skills, or projects), use the specific data provided above to generate a tailored response for them.
        
        User's question: "${userMessage}"`;

        const result = await model.generateContent(prompt);
        res.json({ reply: result.response.text() });
        
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ reply: "Transmission error: My AI core is currently offline." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Secure Server running on port ${PORT}`));